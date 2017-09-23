var DAL = require('../DAL.js');

var usersCollectionName = "Users";
var profileCollectionName = "Profiles";

// Define search cache variables.
var maxImagesInCacheAmount = 50;
var profilesCache = {};
var usersIdsInCache = [];

module.exports = {

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