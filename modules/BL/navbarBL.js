var DAL = require('../DAL.js');

var usersCollectionName = "Users";
var profileCollectionName = "Profiles";

module.exports = {

    GetMainSearchResults: function (searchInput, searchLimit, callback) {
        var usersFilter = { $match: { fullName: new RegExp("^" + searchInput, 'g') } };
        aggregateArray = [{ $project: { fullName: { $concat: ["$firstName", " ", "$lastName"] } } }, usersFilter,
        { $limit: searchLimit }];

        DAL.Aggregate(usersCollectionName, aggregateArray, function (results) {
            var searchResults = [];

            if (!results) {
                callback(null);
            }
            else {
                for (var i = 0; i < results.length; i++) {
                    var result = results[i];
                    result.profile = -1;
                    searchResults.push(result);
                }

                callback(searchResults);
            }
        });
    },

    GetMainSearchResultsWithImages: function (searchInput, searchLimit, callback) {
        var usersFilter = { $match: { fullName: new RegExp("^" + searchInput, 'g') } };
        aggregateArray = [{ $project: { fullName: { $concat: ["$firstName", " ", "$lastName"] }, profile: "$profile" } }, usersFilter,
        { $limit: searchLimit }];

        DAL.Aggregate(usersCollectionName, aggregateArray, function (results) {
            var searchResults = [];

            if (!results) {
                callback(null);
            }
            else if (results.length > 0) {
                var profileIds = [];

                for (var i = 0; i < results.length; i++) {
                    var result = results[i];
                    var profileId = result.profile;
                    searchResults.push(result);

                    if (profileId) {
                        profileIds.push(profileId);
                    }
                }

                var profilesFilter = { "image": true, "userId": true };

                DAL.FindSpecific(profileCollectionName, { "_id": { $in: profileIds } }, profilesFilter, function (profiles) {
                    if (!profiles) {
                        callback(null);
                    }
                    else if (profiles.length > 0) {
                        var usersProfileDictionary = {};

                        for (var i = 0; i < profiles.length; i++) {
                            var profile = profiles[i];
                            usersProfileDictionary[profile.userId.toString()] = profile.image;
                        }

                        for (var i = 0; i < searchResults.length; i++) {
                            var result = searchResults[i];
                            var resultProfile = usersProfileDictionary[result._id.toString()];

                            result.profile = resultProfile;
                        }

                        callback(searchResults);
                    }
                    else {
                        callback(searchResults);
                    }
                });
            }
            else {
                callback(searchResults);
            }
        });
    }

};