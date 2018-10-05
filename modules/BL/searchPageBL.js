const DAL = require('../DAL');
const config = require('../../config');

const usersCollectionName = config.db.collections.users;
const profilesCollectionName = config.db.collections.profiles;

// Define search consts.
const searchResultsLimit = config.navbar.searchResultsLimit;

module.exports = {
    GetSearchPageResults(searchInput) {
        return new Promise((resolve, reject) => {
            searchInput = searchInput.replace(/\\/g, '');

            var concatFields = {
                $project: {
                    "profile": 1,
                    fullName: { $concat: ["$firstName", " ", "$lastName"] },
                    fullNameReversed: { $concat: ["$lastName", " ", "$firstName"] }
                }
            }

            var usersFilter = {
                $match: {
                    $or: [
                        { fullName: new RegExp("^" + searchInput, 'g') },
                        { fullNameReversed: new RegExp("^" + searchInput, 'g') }
                    ]
                }
            };

            var joinFilter = {
                $lookup:
                {
                    from: profilesCollectionName,
                    localField: 'profile',
                    foreignField: '_id',
                    as: 'profileImage'
                }
            };
            var unwindObject = { $unwind: "$profileImage" };
            var usersFinalFieldsWithProfile = { $project: { "fullName": 1, "profileImage.image": 1 } };

            var joinAggregateArray = [
                concatFields,
                usersFilter,
                joinFilter,
                unwindObject,
                usersFinalFieldsWithProfile
            ];

            DAL.Aggregate(usersCollectionName, joinAggregateArray).then((usersWithProfile) => {
                usersWithProfile.forEach(user => {
                    user.profileImage = user.profileImage.image;
                });

                usersFilter.$match.profile = null;
                var usersFinalFieldsWithNoProfile = { $project: { "fullName": 1 } };

                var aggregateArray = [concatFields, usersFilter, usersFinalFieldsWithNoProfile];

                DAL.Aggregate(usersCollectionName, aggregateArray).then((usersWithNoProfile) => {
                    resolve(usersWithProfile.concat(usersWithNoProfile));
                }).catch(reject);
            }).catch(reject);
        });
    }
}