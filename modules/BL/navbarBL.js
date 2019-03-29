const DAL = require('../DAL');
const tokenHandler = require('../handlers/tokenHandler');
const mailer = require('../mailer');
const config = require('../../config');
const logger = require('../../logger');

const usersCollectionName = config.db.collections.users;
const profilesCollectionName = config.db.collections.profiles;

const searchResultsLimit = 4;
const chatMailNotificationDelayTime = 1; // hours

module.exports = {
    GetFriends(friendsIds) {
        return new Promise((resolve, reject) => {
            let friendsObjectIds = ConvertIdsToObjectIds(friendsIds);
            let friendsFilter = { $match: { "_id": { $in: friendsObjectIds } } };
            let joinFilter = {
                $lookup:
                {
                    from: profilesCollectionName,
                    localField: 'profile',
                    foreignField: '_id',
                    as: 'profileImage'
                }
            };
            let unwindObject = {
                $unwind: {
                    path: "$profileImage",
                    preserveNullAndEmptyArrays: true
                }
            };
            let concatFields = {
                $project: {
                    "firstName": 1,
                    "lastName": 1,
                    "profileImage": 1,
                    fullName: { $concat: ["$firstName", " ", "$lastName"] },
                    fullNameReversed: { $concat: ["$lastName", " ", "$firstName"] }
                }
            }
            let sort = { $sort: { "fullName": 1, "fullNameReversed": 1 } };
            let friendsFileds = { $project: { "firstName": 1, "lastName": 1, "profileImage.image": 1 } };

            let aggregateArray = [
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

    GetMainSearchResults(searchInput, userId) {
        return new Promise((resolve, reject) => {
            searchInput = searchInput.replace(/\\/g, '').trim();

            // In case the input is empty, return empty result array.
            if (!searchInput) {
                return resolve([]);
            }

            let projectFields = {
                $project: {
                    "_id": 1,
                    "profile": 1,
                    "firstName": 1,
                    "lastName": 1,
                    "isPrivate": 1,
                    "friends": 1,
                    "friendRequests.send": 1,
                    fullName: { $concat: ["$firstName", " ", "$lastName"] },
                    fullNameReversed: { $concat: ["$lastName", " ", "$firstName"] }
                }
            }

            let usersFilter = {
                $match: {
                    $and: [
                        {
                            $or: [
                                { fullName: new RegExp("^" + searchInput, 'g') },
                                { fullNameReversed: new RegExp("^" + searchInput, 'g') }
                            ]
                        },
                        {
                            $or: [
                                { "isPrivate": false },
                                { "_id": DAL.GetObjectId(userId) },
                                { "friends": { $in: [userId] } },
                                { "friendRequests.send": { $in: [userId] } }

                            ]
                        }
                    ]
                }
            };

            let userResultFields = {
                $project: {
                    "_id": 1,
                    "profile": 1,
                    fullName: { $concat: ["$firstName", " ", "$lastName"] },
                    fullNameReversed: { $concat: ["$lastName", " ", "$firstName"] }
                }
            }

            let sortObj = { $sort: { "fullName": 1, "fullNameReversed": 1 } };
            let limitObj = { $limit: searchResultsLimit };

            let aggregateArray = [projectFields, usersFilter, userResultFields, sortObj, limitObj];

            DAL.Aggregate(usersCollectionName, aggregateArray).then((results) => {
                if (results) {
                    // Running on all results and order profiles structure to the next query
                    // for profile images.
                    results.forEach(result => {
                        result.originalProfile = result.profile;
                        result.profile = result.originalProfile ? -1 : false;
                    });

                    // Second sort for results by the search input string.
                    results = results.sort((a, b) => {
                        let aIndex = a.fullName.indexOf(searchInput);
                        let bIndex = b.fullName.indexOf(searchInput);

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
                }

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
                        let profilesDictionary = {};

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
        let friendIdObject = { "_id": DAL.GetObjectId(friendId) }

        // Specific fields for friend query.
        friendSelectFields = {
            email: 1,
            firstName: 1,
            messagesNotifications: 1
        }

        DAL.FindOneSpecific(usersCollectionName, friendIdObject, friendSelectFields).then((friendObj) => {
            if (friendObj) {
                let messagesNotifications = friendObj.messagesNotifications;

                // Send email in case no notification from the friend
                // exists or first notification is old.
                if (!messagesNotifications ||
                    !messagesNotifications[userId] ||
                    GetDatesHoursDiff(new Date(), messagesNotifications[userId].lastUnreadMessageDate) >=
                    chatMailNotificationDelayTime) {
                    mailer.MessageNotificationAlert(friendObj.email, friendObj.firstName, senderName);
                }

                let friendMessagesNotifications = messagesNotifications ? messagesNotifications[userId] : null;

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
                    .catch(logger.error);
            }
        }).catch(logger.error);
    },

    UpdateMessagesNotifications(userId, messagesNotifications) {
        let userIdObject = {
            "_id": DAL.GetObjectId(userId)
        }

        DAL.UpdateOne(usersCollectionName, userIdObject, { $set: { "messagesNotifications": messagesNotifications } })
            .catch(logger.error);
    },

    RemoveMessagesNotifications(userId, messagesNotifications) {
        let userIdObject = {
            "_id": DAL.GetObjectId(userId)
        }

        DAL.UpdateOne(usersCollectionName, userIdObject, { $set: { "messagesNotifications": messagesNotifications } })
            .catch(logger.error);
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
                let userIdObject = { "_id": DAL.GetObjectId(user._id) }
                let friendIdObject = { "_id": DAL.GetObjectId(friendId) }

                let addRequestToUser = DAL.UpdateOne(usersCollectionName,
                    userIdObject,
                    { $push: { "friendRequests.send": friendId } });
                let addRequestToFriend = DAL.UpdateOne(usersCollectionName,
                    friendIdObject,
                    { $push: { "friendRequests.get": user._id } });

                Promise.all([addRequestToUser, addRequestToFriend]).then(results => {
                    resolve(true);
                }).catch(reject);
            }
        });
    },

    RemoveFriendRequest(userId, friendId) {
        return new Promise((resolve, reject) => {
            let userIdObject = { "_id": DAL.GetObjectId(userId) }
            let friendIdObject = { "_id": DAL.GetObjectId(friendId) }

            let removeRequestFromUser = DAL.UpdateOne(usersCollectionName,
                userIdObject,
                { $pull: { "friendRequests.send": friendId } });
            let removeRequestFromFriend = DAL.UpdateOne(usersCollectionName,
                friendIdObject,
                { $pull: { "friendRequests.get": userId } });

            Promise.all([removeRequestFromUser, removeRequestFromFriend]).then(results => {
                resolve(true);
            }).catch(reject);
        });
    },

    // Remove the friend request from DB after the request confirmed.
    RemoveFriendRequestAfterConfirm(userId, friendId) {
        return new Promise((resolve, reject) => {
            let userIdObject = { "_id": DAL.GetObjectId(userId) }
            let friendIdObject = { "_id": DAL.GetObjectId(friendId) }

            let removeRequestFromUser = DAL.UpdateOne(usersCollectionName,
                userIdObject,
                {
                    $pull: { "friendRequests.send": friendId },
                    $push: { "friendRequests.accept": friendId }
                });

            let removeRequestFromFriend = DAL.UpdateOne(usersCollectionName,
                friendIdObject,
                { $pull: { "friendRequests.get": userId } });

            Promise.all([removeRequestFromUser, removeRequestFromFriend]).then(results => {
                resolve(true);
            }).catch(reject);
        });
    },

    // Remove the friend request from DB if the request was not confirmed.
    IgnoreFriendRequest(userId, friendId) {
        return new Promise((resolve, reject) => {
            let userIdObject = { "_id": DAL.GetObjectId(userId) }
            let friendIdObject = { "_id": DAL.GetObjectId(friendId) }

            let removeRequestFromUser = DAL.UpdateOne(usersCollectionName,
                userIdObject,
                { $pull: { "friendRequests.get": friendId } });

            let removeRequestFromFriend = DAL.UpdateOne(usersCollectionName,
                friendIdObject,
                { $pull: { "friendRequests.send": userId } });

            Promise.all([removeRequestFromUser, removeRequestFromFriend]).then(results => {
                resolve(true);
            }).catch(reject);
        });
    },

    AddFriend(user, friendId) {
        return new Promise((resolve, reject) => {
            // Check if the user and the friend are not already friends.
            if (user.friends.indexOf(friendId) != -1) {
                resolve(null);
                return;
            }

            let userIdObject = { "_id": DAL.GetObjectId(user._id) }
            let friendIdObject = { "_id": DAL.GetObjectId(friendId) }


            let addUserFriendRelation = DAL.UpdateOne(usersCollectionName,
                userIdObject,
                { $push: { "friends": friendId } });

            let addFriendUserRelation = DAL.UpdateOne(usersCollectionName,
                friendIdObject,
                { $push: { "friends": user._id } });

            let removeRequestObject = this.RemoveFriendRequestAfterConfirm(friendId, user._id);

            let addFriendActions = [
                addFriendUserRelation,
                addUserFriendRelation,
                removeRequestObject
            ]

            Promise.all(addFriendActions).then(results => {
                let updatedFriend = results[0];

                // Getting a new token from the user object with the friend.
                user.friends.push(friendId);
                let newToken = tokenHandler.GetTokenFromUserObject(user);

                let clientFriendObject = {
                    "_id": updatedFriend._id.toString(),
                    "email": updatedFriend.email,
                    "firstName": updatedFriend.firstName,
                    "lastName": updatedFriend.lastName,
                    "profileImage": null
                }

                let finalResult = {
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
                        });
                }
                else {
                    resolve(finalResult);
                }
            }).catch(reject);
        });
    },

    RemoveFriendRequestConfirmAlert(data) {
        return new Promise((resolve, reject) => {
            let userObjId = DAL.GetObjectId(data.userId);
            let confirmedFriendsIds = data.confirmedFriendsIds;

            DAL.UpdateOne(usersCollectionName,
                { "_id": userObjId },
                { $pull: { "friendRequests.accept": { $in: confirmedFriendsIds } } }).then((result) => {
                    // Change result to true in case the update succeeded.
                    result && (result = true);
                    resolve(result)
                }).catch(reject);
        });
    }
};

function ConvertIdsToObjectIds(array) {
    for (let i = 0; i < array.length; i++) {
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