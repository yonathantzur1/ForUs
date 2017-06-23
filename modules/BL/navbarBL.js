var DAL = require('../DAL.js');

var usersCollectionName = "Users";
var profileCollectionName = "Profiles";

// Define search cache variables.
var maxImagesInCacheAmount = 50;
var profilesCache = {};
var usersIdsInCache = [];

module.exports = {

    GetMainSearchResults: function (searchInput, searchLimit, callback) {
        var usersFilter = { $match: { $or: [{ fullName: new RegExp("^" + searchInput, 'g') }, { lastName: new RegExp("^" + searchInput, 'g') }] } };
        aggregateArray = [{ $project: { fullName: { $concat: ["$firstName", " ", "$lastName"] }, profile: "$profile", firstName: "$firstName", lastName: "$lastName" } }, usersFilter,
        { $limit: searchLimit }, { $sort: { "fullName": 1 } }];

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