var DAL = require('../DAL.js');

var usersCollectionName = "Users";
var profileCollectionName = "Profiles";

// Define search cache variables.
var maxImagesInCacheAmount = 50;
var imagesInCacheAmount = 0;
var profilesCache = {};
var ImagesIdsInCache = [];

module.exports = {

    GetMainSearchResults: function (searchInput, searchLimit, callback) {
        var usersFilter = { $match: { fullName: new RegExp("^" + searchInput, 'g') } };
        aggregateArray = [{ $project: { fullName: { $concat: ["$firstName", " ", "$lastName"] }, profile: "$profile" } }, usersFilter,
        { $limit: searchLimit }];

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

        var profilesFilter = { "image": true, "userId": true };

        DAL.FindSpecific(profileCollectionName, { "_id": { $in: ConvertIdsToObjectIds(profilesIds) } }, profilesFilter, function (profiles) {
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
    if (imagesInCacheAmount > maxImagesInCacheAmount) {
        for (var i = 0; i < ImagesIdsInCache.length; i++) {
            delete profilesCache[ImagesIdsInCache[i]];
        }

        imagesInCacheAmount = 0;
        ImagesIdsInCache = [];
    }

    profiles.forEach(function (profile) {
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