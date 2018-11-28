const DAL = require('../../DAL');
const tokenHandler = require('../../handlers/tokenHandler');
const mailer = require('../../mailer');
const config = require('../../../config');
const logger = require('../../logger');

const usersCollectionName = config.db.collections.users;
const profilesCollectionName = config.db.collections.profiles;

// Define search consts.
const searchResultsLimit = config.navbar.searchResultsLimit;

var self = module.exports = {

    GetFriends(friendsIds) {
        return new Promise((resolve, reject) => {
            var friendsObjectIds = ConvertIdsToObjectIds(friendsIds);
            var friendsFilter = { $match: { "_id": { $in: friendsObjectIds } } };
            var joinFilter = {
                $lookup:
                {
                    from: profilesCollectionName,
                    localField: 'profile',
                    foreignField: '_id',
                    as: 'profileImage'
                }
            };
            var unwindObject = {
                $unwind: {
                    path: "$profileImage",
                    preserveNullAndEmptyArrays: true
                }
            };
            var concatFields = {
                $project: {
                    "firstName": 1,
                    "lastName": 1,
                    "profileImage": 1,
                    fullName: { $concat: ["$firstName", " ", "$lastName"] },
                    fullNameReversed: { $concat: ["$lastName", " ", "$firstName"] }
                }
            }
            var sort = { $sort: { "fullName": 1, "fullNameReversed": 1 } };
            var friendsFileds = { $project: { "firstName": 1, "lastName": 1, "profileImage.image": 1 } };

            var aggregateArray = [
                friendsFilter,
                joinFilter,
                unwindObject,
                concatFields,
                sort,
                friendsFileds
            ];

            DAL.Aggregate(usersCollectionName, aggregateArray).then((friends) => {
                friends && friends.forEach(friend => {
                    if (friend.profileImage) {
                        friend.profileImage = friend.profileImage.image;
                    }
                });

                resolve(friends);
            }).catch(reject);
        });
    },

    GetMainSearchResults(searchInput) {
        return new Promise((resolve, reject) => {
            searchInput = searchInput.replace(/\\/g, '').trim();

            // In case the input is empty, return empty result array.
            if (!searchInput) {
                return resolve([]);                
            }

            var usersFilter = {
                $match: {
                    $or: [
                        { fullName: new RegExp("^" + searchInput, 'g') },
                        { fullNameReversed: new RegExp("^" + searchInput, 'g') }
                    ]
                }
            };

            var aggregateArray = [{
                $project: {
                    fullName: { $concat: ["$firstName", " ", "$lastName"] },
                    fullNameReversed: { $concat: ["$lastName", " ", "$firstName"] },
                    profile: 1,
                    firstName: 1,
                    lastName: 1
                }
            }, usersFilter,
            { $sort: { "fullName": 1, "fullNameReversed": 1 } },
            { $limit: searchResultsLimit }];

            DAL.Aggregate(usersCollectionName, aggregateArray).then((results) => {
                // Running on all results and order profiles structure to the next query
                // for profile images.
                for (var i = 0; i < results.length; i++) {
                    var result = results[i];
                    result.originalProfile = result.profile;
                    result.profile = result.originalProfile ? -1 : false;
                }

                // Second sort for results by the search input string.
                results = results.sort((a, b) => {
                    var aIndex = a.fullName.indexOf(searchInput);
                    var bIndex = b.fullName.indexOf(searchInput);

                    if (aIndex < bIndex) {
                        return -1;
                    }
                    else if (aIndex > bIndex) {
                        return 1;
                    }
                    else {
                        return 0;
                    }
                });

                resolve(results);
            }).catch(reject);
        });
    },

    GetMainSearchResultsWithImages(profilesIds) {
        return new Promise((resolve, reject) => {
            if (profilesIds.length == 0) {
                resolve(profilesIds);
            }
            else {
                DAL.Find(profilesCollectionName, { "_id": { $in: ConvertIdsToObjectIds(profilesIds) } }).then((profiles) => {
                    if (!profiles) {
                        resolve(null);
                    }
                    else if (profiles.length > 0) {
                        var profilesDictionary = {};

                        profiles.forEach((profile) => {
                            profilesDictionary[profile._id] = profile.image;
                        });

                        resolve(profilesDictionary);
                    }
                    else {
                        resolve(profiles);
                    }
                }).catch(reject);
            }
        });
    },

    GetUserMessagesNotifications(userId) {
        return new Promise((resolve, reject) => {
            DAL.FindOneSpecific(usersCollectionName,
                { _id: DAL.GetObjectId(userId) },
                { "messagesNotifications": 1 }).then(resolve).catch(reject);
        });
    },

    AddMessageNotification(userId, friendId, msgId, senderName) {
        var friendIdObject = {
            "_id": DAL.GetObjectId(friendId)
        }

        // Specific fields for friend query.
        friendSelectFields = {
            email: 1,
            firstName: 1,
            messagesNotifications: 1
        }

        DAL.FindOneSpecific(usersCollectionName, friendIdObject, friendSelectFields).then((friendObj) => {
            if (friendObj) {
                var messagesNotifications = friendObj.messagesNotifications;

                // Send email in case no notification from the friend
                // exists or first notification is old.
                if (!messagesNotifications ||
                    !messagesNotifications[userId] ||
                    GetDatesHoursDiff(new Date(), messagesNotifications[userId].lastUnreadMessageDate) >=
                    config.navbar.messageMailNotificationHoursWaitingDelay) {
                    mailer.MessageNotificationAlert(friendObj.email, friendObj.firstName, senderName);
                }

                var friendMessagesNotifications = messagesNotifications ? messagesNotifications[userId] : null;

                if (friendMessagesNotifications) {
                    friendMessagesNotifications.unreadMessagesNumber++;
                }
                else {
                    messagesNotifications = messagesNotifications || {};
                    messagesNotifications[userId] = {
                        "unreadMessagesNumber": 1,
                        "firstUnreadMessageId": msgId
                    }
                }

                // Adding the notification date to the notification object.
                messagesNotifications[userId].lastUnreadMessageDate = new Date();

                DAL.UpdateOne(usersCollectionName, friendIdObject, { $set: { "messagesNotifications": messagesNotifications } })
                    .then((result) => { }).catch(logger.error);
            }
        }).catch(logger.error);
    },

    UpdateMessagesNotifications(userId, messagesNotifications) {
        var userIdObject = {
            "_id": DAL.GetObjectId(userId)
        }

        DAL.UpdateOne(usersCollectionName, userIdObject, { $set: { "messagesNotifications": messagesNotifications } })
            .then((result) => { }).catch(logger.error);
    },

    RemoveMessagesNotifications(userId, messagesNotifications) {
        var userIdObject = {
            "_id": DAL.GetObjectId(userId)
        }

        DAL.UpdateOne(usersCollectionName, userIdObject, { $set: { "messagesNotifications": messagesNotifications } })
            .then((result) => { }).catch(logger.error);
    },

    GetUserFriendRequests(userId) {
        return new Promise((resolve, reject) => {
            DAL.FindOneSpecific(usersCollectionName,
                { _id: DAL.GetObjectId(userId) },
                { "friendRequests": 1 }).then(resolve).catch(reject);
        });
    },

    AddFriendRequest(user, friendId) {
        return new Promise((resolve, reject) => {
            // Validation check in order to check if the user and the friend are not already friends.
            if (user.friends.indexOf(friendId) != -1) {
                resolve(null);
            }
            else {
                var userIdObject = {
                    "_id": DAL.GetObjectId(user._id)
                }

                var friendIdObject = {
                    "_id": DAL.GetObjectId(friendId)
                }

                // Add the request to the user.
                DAL.UpdateOne(usersCollectionName, userIdObject, { $push: { "friendRequests.send": friendId } }).then((result) => {
                    if (result) {
                        // Add the request to the friend.
                        DAL.UpdateOne(usersCollectionName, friendIdObject, { $push: { "friendRequests.get": user._id } }).then((result) => {
                            result ? resolve(true) : resolve(null);
                        }).catch(reject);
                    }
                    else {
                        resolve(null);
                    }
                }).catch(reject);
            }
        });
    },

    RemoveFriendRequest(userId, friendId) {
        return new Promise((resolve, reject) => {
            var userIdObject = {
                "_id": DAL.GetObjectId(userId)
            }

            var friendIdObject = {
                "_id": DAL.GetObjectId(friendId)
            }

            // Remove the request from the user.
            DAL.UpdateOne(usersCollectionName, userIdObject,
                { $pull: { "friendRequests.send": friendId } }).then((result) => {
                    if (result) {
                        // Remove the request from the friend.
                        DAL.UpdateOne(usersCollectionName, friendIdObject, { $pull: { "friendRequests.get": userId } }).then((result) => {
                            result ? resolve(true) : resolve(null);
                        }).catch(reject);
                    }
                    else {
                        resolve(null);
                    }
                }).catch(reject);
        });
    },

    // Remove the friend request from DB after the request confirmed.
    RemoveFriendRequestAfterConfirm(userId, friendId) {
        return new Promise((resolve, reject) => {
            var userIdObject = {
                "_id": DAL.GetObjectId(userId)
            }

            var friendIdObject = {
                "_id": DAL.GetObjectId(friendId)
            }

            // Remove the request from the user.
            DAL.UpdateOne(usersCollectionName, userIdObject,
                {
                    $pull: { "friendRequests.send": friendId },
                    $push: { "friendRequests.accept": friendId }
                }).then((result) => {
                    if (result) {
                        // Remove the request from the friend.
                        DAL.UpdateOne(usersCollectionName, friendIdObject,
                            { $pull: { "friendRequests.get": userId } }).then((result) => {
                                result ? resolve(true) : resolve(null);
                            }).catch(reject);
                    }
                    else {
                        resolve(null);
                    }
                }).catch(reject);
        });
    },

    // Remove the friend request from DB if the request was not confirmed.
    IgnoreFriendRequest(userId, friendId) {
        return new Promise((resolve, reject) => {
            var userIdObject = {
                "_id": DAL.GetObjectId(userId)
            }

            var friendIdObject = {
                "_id": DAL.GetObjectId(friendId)
            }

            // Remove the request from the user.
            DAL.UpdateOne(usersCollectionName, userIdObject, { $pull: { "friendRequests.get": friendId } }).then((result) => {
                if (result) {
                    // Remove the request from the friend.
                    DAL.UpdateOne(usersCollectionName, friendIdObject, { $pull: { "friendRequests.send": userId } }).then((result) => {
                        result ? resolve(true) : resolve(null);
                    }).catch(reject);
                }
                else {
                    resolve(null);
                }
            }).catch(reject);
        });
    },

    AddFriend(user, friendId) {
        return new Promise((resolve, reject) => {
            // Validation check in order to check if the user and the friend are not already friends.
            if (user.friends.indexOf(friendId) != -1) {
                resolve(null);
            }
            else {
                var userIdObject = {
                    "_id": DAL.GetObjectId(user._id)
                }

                var friendIdObject = {
                    "_id": DAL.GetObjectId(friendId)
                }

                // Add the friend to the user as a friend.
                DAL.UpdateOne(usersCollectionName, userIdObject, { $push: { "friends": friendId } }).then((updatedUser) => {
                    if (updatedUser) {
                        // Getting a new token from the user object with the friend.
                        user.friends.push(friendId);
                        var newToken = tokenHandler.GetTokenFromUserObject(user);

                        // Add the user to the friend as a friend.
                        DAL.UpdateOne(usersCollectionName, friendIdObject, { $push: { "friends": user._id } }).then((updatedFriend) => {
                            if (updatedFriend) {
                                // Remove the friend request that came from the friend.
                                self.RemoveFriendRequestAfterConfirm(friendId, user._id).then((result) => {
                                    if (result) {
                                        var clientFriendObject = {
                                            "_id": updatedFriend._id.toString(),
                                            "email": updatedFriend.email,
                                            "firstName": updatedFriend.firstName,
                                            "lastName": updatedFriend.lastName,
                                            "profileImage": null
                                        }

                                        var finalResult = {
                                            "token": newToken,
                                            "friend": clientFriendObject
                                        }

                                        // In case the friend has profile image.
                                        if (updatedFriend.profile) {
                                            // Getting the friend profile image.
                                            DAL.FindOneSpecific(profilesCollectionName,
                                                { "_id": updatedFriend.profile },
                                                { "image": 1 }).then((result) => {
                                                    finalResult.friend.profileImage = result.image;
                                                    resolve(finalResult);
                                                }).catch(reject);
                                        }
                                        else {
                                            resolve(finalResult);
                                        }
                                    }
                                    else {
                                        resolve(null);
                                    }
                                }).catch(reject);
                            }
                            else {
                                resolve(null);
                            }
                        }).catch(reject);
                    }
                    else {
                        resolve(null);
                    }
                }).catch(reject);
            }
        });
    }
};

function ConvertIdsToObjectIds(array) {
    for (var i = 0; i < array.length; i++) {
        array[i] = DAL.GetObjectId(array[i]);
    }

    return array;
}

function GetDatesHoursDiff(date1, date2) {
    if (!date1 || !date2) {
        return -1;
    }
    else {
        return (Math.abs(date1 - date2) / 36e5);
    }
}