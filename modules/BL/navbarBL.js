var DAL = require('../DAL.js');
var general = require('../general.js');

var usersCollectionName = "Users";
var profileCollectionName = "Profiles";

// Define search cache variables.
var maxImagesInCacheAmount = 50;
var profilesCache = {};
var usersIdsInCache = [];

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
        var lookupToObject = { $unwind: "$profileImage" };
        var friendsFileds = { $project: { "firstName": 1, "lastName": 1, "profileImage.image": 1 } };

        var aggregateArray = [friendsFilter, joinFilter, lookupToObject, friendsFileds];

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

    GetMainSearchResults: function (searchInput, searchLimit, callback) {
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
        { $limit: searchLimit },
        { $sort: { "fullName": 1 } }];

        DAL.Aggregate(usersCollectionName, aggregateArray, function (results) {
            if (!results) {
                callback(null);
            }
            else {
                for (var i = 0; i < results.length; i++) {
                    var result = results[i];
                    result.originalProfile = result.profile;
                    result.profile = -1;
                }

                results = GetResultsImagesFromCache(results);

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
                InsertResultsImagesToCache(profiles, resultsIdsWithNoProfile);
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

    AddMessageNotification: function (userId, friendId, msgId) {
        var friendIdObject = {
            "_id": DAL.GetObjectId(friendId)
        }

        DAL.FindOneSpecific(usersCollectionName, friendIdObject, { "messagesNotifications": 1 }, function (result) {
            var messagesNotifications = result.messagesNotifications;

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

    RemoveFriendRequest: function (userId, friendId, callback) {
        var userIdObject = {
            "_id": DAL.GetObjectId(userId)
        }

        var friendIdObject = {
            "_id": DAL.GetObjectId(friendId)
        }

        // Remove the request from the user.
        DAL.UpdateOne(usersCollectionName, userIdObject, { $pull: { "friendRequests.send": friendId } }, function (result) {
            if (result) {
                // Remove the request from the friend.
                DAL.UpdateOne(usersCollectionName, friendIdObject, { $pull: { "friendRequests.get": userId } }, function (result) {
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
                    var newToken = general.GetTokenFromUserObject(updatedUser);

                    // Add the user to the friend as a friend.
                    DAL.UpdateOne(usersCollectionName, friendIdObject, { $push: { "friends": user._id } }, function (updatedFriend) {
                        if (updatedFriend) {
                            // Remove the friend request that came from the friend.
                            self.RemoveFriendRequest(friendId, user._id, function (result) {
                                if (result) {
                                    var clientFriendObject = {
                                        "_id": updatedFriend._id.toString(),
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

function InsertResultsImagesToCache(profiles, resultsIdsWithNoProfile) {
    if (usersIdsInCache.length > maxImagesInCacheAmount) {
        usersIdsInCache.forEach(id => {
            delete profilesCache[id];
        });

        usersIdsInCache = [];
    }

    profiles.forEach(function (profile) {
        var profileFromCache = profilesCache[profile.userId.toString()];

        // In case the user image is not in cache.
        if (!profileFromCache) {
            usersIdsInCache.push(profile.userId.toString());
        }

        profilesCache[profile.userId.toString()] = profile.image;
    });

    resultsIdsWithNoProfile.forEach(function (id) {
        profilesCache[id] = false;
    });
}

function GetResultsImagesFromCache(results) {
    for (var i = 0; i < results.length; i++) {
        if (!results[i].originalProfile) {
            profilesCache[results[i]._id] = false;
        }

        var profile = profilesCache[results[i]._id];

        if (profile) {
            results[i].profile = profile;
        }
        else if (profile == false) {
            results[i].profile = null;
        }
    }

    return results;
}