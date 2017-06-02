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

    GetMainSearchResultsWithImages: function (results, callback) {
        var profileIds = [];

        for (var i = 0; i < results.length; i++) {
            var result = results[i];
            var profileId = result.originalProfile;

            if (profileId) {
                profileIds.push(profileId);
            }
        }

        var profilesFilter = { "image": true, "userId": true };

        DAL.FindSpecific(profileCollectionName, { "_id": { $in: ConvertIdsToObjectIds(profileIds) } }, profilesFilter, function (profiles) {
            if (!profiles) {
                callback(null);
            }
            else if (profiles.length > 0) {
                var usersProfileDictionary = {};

                for (var i = 0; i < profiles.length; i++) {
                    var profile = profiles[i];
                    usersProfileDictionary[profile.userId.toString()] = profile.image;
                }

                for (var i = 0; i < results.length; i++) {
                    var result = results[i];
                    var resultProfile = usersProfileDictionary[result._id.toString()];

                    delete result.originalProfile;
                    result.profile = resultProfile;
                }

                InsertResultsImagesToCache(results);

                callback(results);
            }
            else {
                for (var i = 0; i < results.length; i++) {
                    results[i].profile = null;
                }

                callback(results);
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

function InsertResultsImagesToCache(results) {
    if (imagesInCacheAmount > maxImagesInCacheAmount) {
        for (var i = 0; i < ImagesIdsInCache.length; i++) {
            delete profilesCache[ImagesIdsInCache[i]];
        }

        imagesInCacheAmount = 0;
        ImagesIdsInCache = [];
    }

    for (var i = 0; i < results.length; i++) {
        if (results[i].profile) {
            if (profilesCache[results[i]._id] == null) {
                ImagesIdsInCache.push(results[i]._id);
                imagesInCacheAmount++;
            }

            profilesCache[results[i]._id] = results[i].profile;
        }
        else {
            profilesCache[results[i]._id] = false;
        }
    }
}

function GetResultsImagesFromCache(results) {
    for (var i = 0; i < results.length; i++) {
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