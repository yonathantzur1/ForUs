const DAL = require('../DAL');
const config = require('../../config');

const usersCollectionName = config.db.collections.users;
const profilesCollectionName = config.db.collections.profiles;

// Define search consts.
const searchResultsLimit = config.navbar.searchResultsLimit;

module.exports = {
    GetSearchPageResults(searchInput) {
        return new Promise((resolve, reject) => {
            // In case the search input is empty.
            if (!searchInput) {
                return reject();
            }

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
            var unwindObject = {
                $unwind: {
                    path: "$profileImage",
                    preserveNullAndEmptyArrays: true
                }
            };
            var sort = { $sort: { "fullName": 1, "fullNameReversed": 1 } };
            var usersFinalFieldsWithProfile = { $project: { "fullName": 1, "profileImage.image": 1 } };

            var joinAggregateArray = [
                concatFields,
                usersFilter,
                joinFilter,
                unwindObject,
                sort,
                usersFinalFieldsWithProfile
            ];

            DAL.Aggregate(usersCollectionName, joinAggregateArray).then((users) => {
                if (users) {
                    // Second sort for results by the search input string.
                    users = users.sort((a, b) => {
                        var aIndex = a.fullName.indexOf(searchInput);
                        var bIndex = b.fullName.indexOf(searchInput);

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

                    users.forEach(user => {
                        if (user.profileImage) {
                            user.profileImage = user.profileImage.image;
                        }
                    });
                }

                resolve(users);
            }).catch(reject);
        });
    },

    GetUserFriendRequests(userId) {
        return new Promise((resolve, reject) => {
            var query = { "_id": DAL.GetObjectId(userId) };
            var fields = { "_id": 0, "friendRequests.get": 1, "friendRequests.send": 1 };

            DAL.FindOneSpecific(usersCollectionName, query, fields).then(resolve).catch(reject);
        });
    }
}