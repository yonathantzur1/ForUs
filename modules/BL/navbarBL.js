const DAL = require('../DAL');
const general = require('../general');
const mailer = require('../mailer');
const config = require('../config');

const usersCollectionName = config.db.collections.users;
const profileCollectionName = config.db.collections.profiles;

// Define search consts.
const searchResultsLimit = config.search.resultsLimit;

var self = module.exports = {

    GetFriends: function (friendsIds, callback) {
        var friendsObjectIds = ConvertIdsToObjectIds(friendsIds);
        var friendsFilter = { $match: { "_id": { $in: friendsObjectIds } } };
        var joinFilter = {
            $lookup:
                {
                    from: profileCollectionName,
                    localField: 'profile',
                    foreignField: '_id',
                    as: 'profileImage'
                }
        }
        var unwindObject = { $unwind: "$profileImage" };
        var friendsFileds = { $project: { "firstName": 1, "lastName": 1, "profileImage.image": 1 } };

        var aggregateArray = [friendsFilter, joinFilter, unwindObject, friendsFileds];

        DAL.Aggregate(usersCollectionName, aggregateArray, function (friendsWithProfile) {
            friendsWithProfile.forEach(friend => {
                friend.profileImage = friend.profileImage.image;
            });

            var friendsFilterWithNoProfile = { "_id": { $in: friendsObjectIds }, profile: { $eq: null } };
            var friendsFiledsWithNoProfile = { "firstName": true, "lastName": true };

            DAL.FindSpecific(usersCollectionName, friendsFilterWithNoProfile, friendsFiledsWithNoProfile, function (friendsWithNoProfile) {
                if (!friendsWithProfile || !friendsWithNoProfile) {
                    callback(null);
                }
                else {
                    callback(friendsWithProfile.concat(friendsWithNoProfile));
                }
            });
        })
    },

    GetMainSearchResults: function (searchInput, callback) {
        searchInput = searchInput.replace(/\\/g, '');

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
        { $limit: searchResultsLimit },
        { $sort: { "fullName": 1, "fullNameReversed": 1 } }];

        DAL.Aggregate(usersCollectionName, aggregateArray, function (results) {
            if (!results) {
                callback(null);
            }
            else {
                // Running on all results and order profiles structure to the next query
                // for profile images.
                for (var i = 0; i < results.length; i++) {
                    var result = results[i];
                    result.originalProfile = result.profile;
                    result.profile = result.originalProfile ? -1 : false;
                }

                // Second sort for results by the search input string.
                results = results.sort((a, b) => {
                    var aIndex = Math.min(a.fullName.indexOf(searchInput),
                        a.fullNameReversed.indexOf(searchInput));
                    var bIndex = Math.min(b.fullName.indexOf(searchInput),
                        b.fullNameReversed.indexOf(searchInput));

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

                callback(results);
            }
        });
    },

    GetMainSearchResultsWithImages: function (ids, callback) {
        var profilesIds = ids.profilesIds;
        var resultsIdsWithNoProfile = ids.resultsIdsWithNoProfile;

        DAL.Find(profileCollectionName, { "_id": { $in: ConvertIdsToObjectIds(profilesIds) } }, function (profiles) {
            if (!profiles) {
                callback(null);
            }
            else if (profiles.length > 0) {
                var profilesDictionary = {};

                profiles.forEach(function (profile) {
                    profilesDictionary[profile._id] = profile.image;
                });

                callback(profilesDictionary);
            }
            else {
                callback(profiles);
            }
        });

    },

    GetUserMessagesNotifications: function (userId, callback) {
        DAL.FindOneSpecific(usersCollectionName,
            { _id: DAL.GetObjectId(userId) },
            { "messagesNotifications": 1 },
            function (messagesNotifications) {
                callback(messagesNotifications);
            });
    },

    AddMessageNotification: function (userId, friendId, msgId, senderName) {
        var friendIdObject = {
            "_id": DAL.GetObjectId(friendId)
        }

        // Specific fields for friend query.
        friendSelectFields = {
            email: 1,
            firstName: 1,
            messagesNotifications: 1
        }

        DAL.FindOneSpecific(usersCollectionName, friendIdObject, friendSelectFields, function (friendObj) {
            if (friendObj) {
                var messagesNotifications = friendObj.messagesNotifications;

                // Send email in case no notification exists
                if (!messagesNotifications || !messagesNotifications[userId]) {
                    mailer.SendMail(friendObj.email, mailer.GetMessageNotificationAlertContent(friendObj.firstName, senderName));
                }

                var friendMessagesNotifications = messagesNotifications ? messagesNotifications[userId] : null;

                if (friendMessagesNotifications) {
                    friendMessagesNotifications.unreadMessagesNumber++;
                }
                else {
                    messagesNotifications = messagesNotifications ? messagesNotifications : {};
                    messagesNotifications[userId] = {
                        "unreadMessagesNumber": 1,
                        "firstUnreadMessageId": msgId
                    }
                }

                DAL.UpdateOne(usersCollectionName, friendIdObject, { $set: { "messagesNotifications": messagesNotifications } }, function (result) { });
            }
        });
    },

    UpdateMessagesNotifications: function (userId, messagesNotifications) {
        var userIdObject = {
            "_id": DAL.GetObjectId(userId)
        }

        DAL.UpdateOne(usersCollectionName, userIdObject, { $set: { "messagesNotifications": messagesNotifications } }, function (result) { });
    },

    RemoveMessagesNotifications: function (userId, messagesNotifications) {
        var userIdObject = {
            "_id": DAL.GetObjectId(userId)
        }

        DAL.UpdateOne(usersCollectionName, userIdObject, { $set: { "messagesNotifications": messagesNotifications } }, function (result) { });
    },

    GetUserFriendRequests: function (userId, callback) {
        DAL.FindOneSpecific(usersCollectionName,
            { _id: DAL.GetObjectId(userId) },
            { "friendRequests": 1 },
            function (friendRequests) {
                callback(friendRequests);
            });
    },

    AddFriendRequest: function (user, friendId, callback) {
        // Validation check in order to check if the user and the friend are not already friends.
        if (user.friends.indexOf(friendId) != -1) {
            callback(null);
        }
        else {
            var userIdObject = {
                "_id": DAL.GetObjectId(user._id)
            }

            var friendIdObject = {
                "_id": DAL.GetObjectId(friendId)
            }

            // Add the request to the user.
            DAL.UpdateOne(usersCollectionName, userIdObject, { $push: { "friendRequests.send": friendId } }, function (result) {
                if (result) {
                    // Add the request to the friend.
                    DAL.UpdateOne(usersCollectionName, friendIdObject, { $push: { "friendRequests.get": user._id } }, function (result) {
                        result ? callback(true) : callback(null);
                    });
                }
                else {
                    callback(null);
                }
            });
        }
    },

    // Remove the friend request from DB after the request confirmed.
    RemoveFriendRequestAfterConfirm: function (userId, friendId, callback) {
        var userIdObject = {
            "_id": DAL.GetObjectId(userId)
        }

        var friendIdObject = {
            "_id": DAL.GetObjectId(friendId)
        }

        // Remove the request from the user.
        DAL.UpdateOne(usersCollectionName, userIdObject,
            { $pull: { "friendRequests.send": friendId }, $push: { "friendRequests.accept": friendId } },
            function (result) {
                if (result) {
                    // Remove the request from the friend.
                    DAL.UpdateOne(usersCollectionName, friendIdObject,
                        { $pull: { "friendRequests.get": userId } },
                        function (result) {
                            result ? callback(true) : callback(null);
                        });
                }
                else {
                    callback(null);
                }
            });
    },

    // Remove the friend request from DB if the request was not confirmed.
    IgnoreFriendRequest: function (userId, friendId, callback) {
        var userIdObject = {
            "_id": DAL.GetObjectId(userId)
        }

        var friendIdObject = {
            "_id": DAL.GetObjectId(friendId)
        }

        // Remove the request from the user.
        DAL.UpdateOne(usersCollectionName, userIdObject, { $pull: { "friendRequests.get": friendId } }, function (result) {
            if (result) {
                // Remove the request from the friend.
                DAL.UpdateOne(usersCollectionName, friendIdObject, { $pull: { "friendRequests.send": userId } }, function (result) {
                    result ? callback(true) : callback(null);
                });
            }
            else {
                callback(null);
            }
        });
    },

    AddFriend: function (user, friendId, callback) {
        // Validation check in order to check if the user and the friend are not already friends.
        if (user.friends.indexOf(friendId) != -1) {
            callback(null);
        }
        else {
            var userIdObject = {
                "_id": DAL.GetObjectId(user._id)
            }

            var friendIdObject = {
                "_id": DAL.GetObjectId(friendId)
            }

            // Add the friend to the user as a friend.
            DAL.UpdateOne(usersCollectionName, userIdObject, { $push: { "friends": friendId } }, function (updatedUser) {
                if (updatedUser) {
                    // Getting a new token from the user object with the friend.
                    user.friends.push(friendId);
                    var newToken = general.GetTokenFromUserObject(user);

                    // Add the user to the friend as a friend.
                    DAL.UpdateOne(usersCollectionName, friendIdObject, { $push: { "friends": user._id } }, function (updatedFriend) {
                        if (updatedFriend) {
                            // Remove the friend request that came from the friend.
                            self.RemoveFriendRequestAfterConfirm(friendId, user._id, function (result) {
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
                                        DAL.FindOneSpecific(profileCollectionName,
                                            { "_id": updatedFriend.profile },
                                            { "image": 1 },
                                            function (result) {
                                                finalResult.friend.profileImage = result.image;
                                                callback(finalResult);
                                            });
                                    }
                                    else {
                                        callback(finalResult);
                                    }
                                }
                                else {
                                    callback(null);
                                }
                            });
                        }
                        else {
                            callback(null);
                        }
                    });
                }
                else {
                    callback(null);
                }
            });
        }
    }
};

function ConvertIdsToObjectIds(array) {
    for (var i = 0; i < array.length; i++) {
        array[i] = DAL.GetObjectId(array[i]);
    }

    return array;
}
