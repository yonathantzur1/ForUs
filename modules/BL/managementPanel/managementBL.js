const DAL = require('../../DAL');
const config = require('../../../config');
const general = require('../../general');
const mailer = require('../../mailer');
const sha512 = require('js-sha512');

const usersCollectionName = config.db.collections.users;
const chatsCollectionName = config.db.collections.chats;
const profilesCollectionName = config.db.collections.profiles;
const permissionsCollectionName = config.db.collections.permissions;

module.exports = {
    GetUserByName: (searchInput) => {
        return new Promise((resolve, reject) => {
            searchInput = searchInput.replace(/\\/g, '');

            var usersFilter = {
                $match: {
                    $or: [
                        { fullName: new RegExp("^" + searchInput, 'g') },
                        { fullNameReversed: new RegExp("^" + searchInput, 'g') }
                    ]
                }
            };

            var joinFilter = {
                $lookup: {
                    from: profilesCollectionName,
                    localField: 'profile',
                    foreignField: '_id',
                    as: 'profileImage'
                }
            }

            var aggregateArray = [
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

                users = users.map(user => {
                    user.profileImage = (user.profileImage.length != 0) ? user.profileImage[0] : null;

                    return user;
                });

                resolve(users);
            }).catch(reject);
        });
    },

    GetUserFriends: (friendsIds) => {
        return new Promise((resolve, reject) => {
            friendsIds = friendsIds.map((id) => {
                return DAL.GetObjectId(id);
            });

            var usersFilter = {
                $match: { "_id": { $in: friendsIds } }
            };

            var joinFilter = {
                $lookup: {
                    from: profilesCollectionName,
                    localField: 'profile',
                    foreignField: '_id',
                    as: 'profileImage'
                }
            }

            var aggregateArray = [
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

    UpdateUser: (updateFields) => {
        return new Promise((resolve, reject) => {
            var userId = DAL.GetObjectId(updateFields._id);
            delete updateFields._id;

            // Generate password hash and salt.
            if (updateFields.password) {
                updateFields.uid = general.GenerateId();
                updateFields.salt = general.GenerateCode(config.security.loginSecure.saltSize);
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

    BlockUser: (blockObj) => {
        return new Promise((resolve, reject) => {
            var userId = DAL.GetObjectId(blockObj._id);
            var unblockDate = null;

            if (!blockObj.blockAmount.forever) {
                // Calculate unblock date
                unblockDate = new Date();
                unblockDate.setDate(unblockDate.getDate() + (blockObj.blockAmount.days));
                unblockDate.setDate(unblockDate.getDate() + (blockObj.blockAmount.weeks * 7));
                unblockDate.setMonth(unblockDate.getMonth() + (blockObj.blockAmount.months));
                unblockDate.setHours(0, 0, 0, 0);
            }

            var block = {
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

    UnblockUser: (userId) => {
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

    RemoveFriends: (userId, friendId) => {
        return new Promise((resolve, reject) => {
            var notificationsUnsetJson = {};
            notificationsUnsetJson["messagesNotifications." + userId] = 1;
            notificationsUnsetJson["messagesNotifications." + friendId] = 1;

            DAL.Delete(chatsCollectionName,
                { "membersIds": general.SortArray([userId, friendId]) }).then((result) => {
                    DAL.Update(usersCollectionName,
                        {
                            $or: [
                                { "_id": DAL.GetObjectId(userId) },
                                { "_id": DAL.GetObjectId(friendId) }
                            ]
                        },
                        {
                            $pull: {
                                "friends": { $in: [userId, friendId] },
                                "friendRequests.get": { $in: [userId, friendId] },
                                "friendRequests.send": { $in: [userId, friendId] },
                                "friendRequests.accept": { $in: [userId, friendId] }
                            },
                            $unset: notificationsUnsetJson
                        }).then((result) => {
                            // Change result to true in case the update succeeded.
                            result && (result = true);
                            resolve(result);
                        }).catch(reject);
                }).catch(reject);
        });
    },

    DeleteUser: (userId) => {
        return new Promise((resolve, reject) => {
            var userObjectId = DAL.GetObjectId(userId);
            var notificationsUnsetJson = {};
            notificationsUnsetJson["messagesNotifications." + userId] = 1;

            var deletedUserFriends;

            // Getting deleted user friends.
            DAL.FindOneSpecific(usersCollectionName,
                { "_id": userObjectId },
                { "friends": 1, "friendRequests.send": 1 }).then((result) => {
                    if (result) {
                        deletedUserFriends = result.friends.concat(result.friendRequests.send);

                        // Remove all permissions of the user.
                        DAL.Update(permissionsCollectionName,
                            {}, // All permissions
                            { $pull: { "members": userObjectId } }).then((result) => {
                                // Remove all chats of the user.
                                DAL.Delete(chatsCollectionName,
                                    { "membersIds": userId }).then((result) => {
                                        // Remove user from all users friends list and message notifications.
                                        DAL.Update(usersCollectionName,
                                            {}, // All users
                                            {
                                                $pull: {
                                                    "friends": userId,
                                                    "friendRequests.get": userId,
                                                    "friendRequests.send": userId,
                                                    "friendRequests.accept": userId
                                                },
                                                $unset: notificationsUnsetJson
                                            }).then((result) => {
                                                // Remove all user profiles images.
                                                DAL.Delete(profilesCollectionName,
                                                    { "userId": userObjectId }).then((result) => {
                                                        // Remove the user object.
                                                        DAL.DeleteOne(usersCollectionName,
                                                            { "_id": userObjectId }).then((result) => {
                                                                // Return user friends ids in case the delete succeeded.
                                                                result && (result = deletedUserFriends);
                                                                resolve(result);
                                                            }).catch(reject);
                                                    }).catch(reject);
                                            }).catch(reject);
                                    }).catch(reject);
                            }).catch(reject);
                    }
                    else {
                        resolve(result);
                    }
                }).catch(reject);
        });
    }
};