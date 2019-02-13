const DAL = require('../../DAL');
const config = require('../../../config');
const generator = require('../../generator');
const mailer = require('../../mailer');
const sha512 = require('js-sha512');

const userPageBL = require('../userPage/userPageBL');
const deleteUserBL = require('../deleteUserBL');

const usersCollectionName = config.db.collections.users;
const profilesCollectionName = config.db.collections.profiles;

module.exports = {
    GetUserByName(searchInput) {
        return new Promise((resolve, reject) => {
            try {
                searchInput = DAL.GetObjectId(searchInput);
            }
            catch (e) {
                searchInput = searchInput.replace(/\\/g, '').trim();

                // In case the input is empty, return empty result array.
                if (!searchInput) {
                    return resolve([]);                    
                }
            }

            let usersFilter = {
                $match: {
                    $or: [
                        { _id: searchInput },
                        { fullName: new RegExp("^" + searchInput, 'g') },
                        { fullNameReversed: new RegExp("^" + searchInput, 'g') },
                        { email: new RegExp("^" + searchInput, 'g') }
                    ]
                }
            };

            let joinFilter = {
                $lookup: {
                    from: profilesCollectionName,
                    localField: 'profile',
                    foreignField: '_id',
                    as: 'profileImage'
                }
            }

            let aggregateArray = [
                {
                    $project: {
                        fullName: { $concat: ["$firstName", " ", "$lastName"] },
                        fullNameReversed: { $concat: ["$lastName", " ", "$firstName"] },
                        friendsNumber: { $size: "$friends" },
                        "firstName": 1,
                        "lastName": 1,
                        "email": 1,
                        "profile": 1,
                        "creationDate": 1,
                        "lastLoginTime": 1,
                        "friends": 1,
                        "block": 1
                    }
                },
                usersFilter,
                joinFilter,
                {
                    $project: {
                        // Should be here and on $project above because how aggregate works.
                        "firstName": 1,
                        "lastName": 1,
                        "fullName": 1,
                        "fullNameReversed": 1,
                        "email": 1,
                        "creationDate": 1,
                        "lastLoginTime": 1,
                        "friendsNumber": 1,
                        "friends": 1,
                        "block": 1,

                        // Taking only specific fields from the document.
                        "profileImage.image": 1,
                        "profileImage.updateDate": 1
                    }
                },
                {
                    $sort: { "fullName": 1, "fullNameReversed": 1 }
                }
            ];

            DAL.Aggregate(usersCollectionName, aggregateArray).then((users) => {
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

                users = users.map(user => {
                    user.profileImage = (user.profileImage.length != 0) ? user.profileImage[0] : null;

                    return user;
                });

                resolve(users);
            }).catch(reject);
        });
    },

    GetUserFriends(friendsIds) {
        return new Promise((resolve, reject) => {
            friendsIds = friendsIds.map((id) => {
                return DAL.GetObjectId(id);
            });

            let usersFilter = {
                $match: { "_id": { $in: friendsIds } }
            };

            let joinFilter = {
                $lookup: {
                    from: profilesCollectionName,
                    localField: 'profile',
                    foreignField: '_id',
                    as: 'profileImage'
                }
            }

            let aggregateArray = [
                usersFilter,
                joinFilter,
                {
                    $project: {
                        fullName: { $concat: ["$firstName", " ", "$lastName"] },
                        fullNameReversed: { $concat: ["$lastName", " ", "$firstName"] },
                        "profileImage.image": 1
                    }
                },
                {
                    $sort: { "fullName": 1, "fullNameReversed": 1 }
                }
            ];

            DAL.Aggregate(usersCollectionName, aggregateArray).then((friends) => {
                friends = friends.map(friend => {
                    friend.profileImage = (friend.profileImage.length != 0) ? friend.profileImage[0].image : null;

                    return friend;
                });

                resolve(friends);
            }).catch(reject);
        });
    },

    UpdateUser(updateFields) {
        return new Promise((resolve, reject) => {
            let userId = DAL.GetObjectId(updateFields._id);
            delete updateFields._id;

            // Generate password hash and salt.
            if (updateFields.password) {
                updateFields.uid = generator.GenerateId();
                updateFields.salt = generator.GenerateCode(config.security.password.saltSize);
                updateFields.password = sha512(updateFields.password + updateFields.salt);
            }

            DAL.UpdateOne(usersCollectionName,
                { "_id": userId },
                { $set: updateFields }).then((result) => {
                    // Change result to true in case the update succeeded.
                    result && (result = true);
                    resolve(result);
                }).catch(reject);
        });
    },

    BlockUser(blockObj) {
        return new Promise((resolve, reject) => {
            let userId = DAL.GetObjectId(blockObj._id);
            let unblockDate = null;

            if (!blockObj.blockAmount.forever) {
                // Calculate unblock date
                unblockDate = new Date();
                unblockDate.setDate(unblockDate.getDate() + (blockObj.blockAmount.days));
                unblockDate.setDate(unblockDate.getDate() + (blockObj.blockAmount.weeks * 7));
                unblockDate.setMonth(unblockDate.getMonth() + (blockObj.blockAmount.months));
                unblockDate.setHours(0, 0, 0, 0);
            }

            let block = {
                reason: blockObj.blockReason,
                unblockDate
            }

            DAL.UpdateOne(usersCollectionName,
                { "_id": userId },
                { $set: { block } }).then((result) => {
                    if (result) {
                        mailer.BlockMessage(result.email, result.firstName, block.reason, block.unblockDate);

                        // Change result to true in case the update succeeded.
                        result = result.block;
                    }

                    resolve(result);
                }).catch(reject);
        });
    },

    UnblockUser(userId) {
        return new Promise((resolve, reject) => {
            DAL.UpdateOne(usersCollectionName,
                { "_id": DAL.GetObjectId(userId) },
                { $unset: { "block": 1 } }).then((result) => {
                    // Change result to true in case the update succeeded.
                    result && (result = true);
                    resolve(result);
                }).catch(reject);
        });
    },

    RemoveFriends(userId, friendId) {
        return new Promise((resolve, reject) => {
            userPageBL.RemoveFriends(userId, friendId).then(resolve).catch(reject);
        });
    },

    DeleteUser(userId) {
        return deleteUserBL.DeleteUserFromDB(userId);
    }
};