const DAL = require('../DAL');
const config = require('../../config');

const usersCollectionName = config.db.collections.users;
const profilesCollectionName = config.db.collections.profiles;

module.exports = {
    GetSearchPageResults(searchInput, userId) {
        return new Promise((resolve, reject) => {
            // In case the search input is empty.
            if (!searchInput) {
                return reject();
            }

            let userObjectId = DAL.GetObjectId(userId);
            searchInput = searchInput.replace(/\\/g, '');

            let projectFields = {
                $project: {
                    "_id": 1,
                    "profile": 1,
                    "friends": 1,
                    "isPrivate": 1,
                    "friendRequests.send": 1,
                    fullName: { $concat: ["$firstName", " ", "$lastName"] },
                    fullNameReversed: { $concat: ["$lastName", " ", "$firstName"] }
                }
            }

            let usersFilter = {
                $match: {
                    $and: [
                        {
                            $or: [
                                { fullName: new RegExp("^" + searchInput, 'g') },
                                { fullNameReversed: new RegExp("^" + searchInput, 'g') }
                            ]
                        },
                        {
                            $or: [
                                { "isPrivate": false },
                                { "_id": userObjectId },
                                { "friends": userObjectId },
                                { "friendRequests.send": userId }
                            ]
                        }
                    ]
                }
            };

            let joinFilter = {
                $lookup:
                {
                    from: profilesCollectionName,
                    localField: 'profile',
                    foreignField: '_id',
                    as: 'profileImage'
                }
            };
            let unwindObject = {
                $unwind: {
                    path: "$profileImage",
                    preserveNullAndEmptyArrays: true
                }
            };
            let sort = { $sort: { "fullName": 1, "fullNameReversed": 1 } };
            let usersFinalFieldsWithProfile = { $project: { "fullName": 1, "profileImage.image": 1 } };

            let joinAggregateArray = [
                projectFields,
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
                        let aIndex = a.fullName.indexOf(searchInput);
                        let bIndex = b.fullName.indexOf(searchInput);

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
            let query = { "_id": DAL.GetObjectId(userId) };
            let fields = { "_id": 0, "friendRequests.get": 1, "friendRequests.send": 1 };

            DAL.FindOneSpecific(usersCollectionName, query, fields).then(resolve).catch(reject);
        });
    }
}