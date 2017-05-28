var DAL = require('../DAL.js');

var usersCollectionName = "Users";
var profileCollectionName = "Profiles";

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