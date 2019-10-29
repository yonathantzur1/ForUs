const DAL = require('../../DAL');
const config = require('../../../config');
const generator = require('../../generator');
const mailer = require('../../mailer');
const sha512 = require('js-sha512');
const permissionHandler = require('../../handlers/permissionHandler');
const errorHandler = require('../../handlers/errorHandler');

const userPageBL = require('../userPage/userPageBL');
const deleteUserBL = require('../deleteUserBL');

const usersCollectionName = config.db.collections.users;
const permissionsCollectionName = config.db.collections.permissions;
const profilePicturesCollectionName = config.db.collections.profilePictures;

module.exports = {
    async getUserByName(searchInput) {
        // In case the input is empty, return empty result array.
        if (!searchInput) {
            return [];
        }

        try {
            searchInput = DAL.getObjectId(searchInput);
        }
        catch (e) {
            searchInput = searchInput.replace(/\\/g, '').trim();
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

        let profileImageJoinFilter = {
            $lookup: {
                from: profilePicturesCollectionName,
                localField: 'profile',
                foreignField: '_id',
                as: 'profileImage'
            }
        };

        let permissionsJoinFilter = {
            $lookup:
            {
                from: permissionsCollectionName,
                localField: '_id',
                foreignField: 'members',
                as: 'permissions'
            }
        };

        let aggregateArray = [
            {
                $project: {
                    fullName: { $concat: ["$firstName", " ", "$lastName"] },
                    fullNameReversed: { $concat: ["$lastName", " ", "$firstName"] },
                    friendsAmount: { $size: "$friends" },
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
            profileImageJoinFilter,
            permissionsJoinFilter,
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
                    "friendsAmount": 1,
                    "friends": 1,
                    "block": 1,

                    // Taking only specific fields from the document.
                    "permissions.type": 1,
                    "profileImage.image": 1,
                    "profileImage.updateDate": 1
                }
            },
            {
                $sort: { "fullName": 1, "fullNameReversed": 1 }
            }
        ];

        let users = await DAL.aggregate(usersCollectionName, aggregateArray)
            .catch(errorHandler.promiseError);

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

        return users.map(user => {
            user.profileImage = (user.profileImage.length != 0) ? user.profileImage[0] : null;
            user.permissions = user.permissions.map(permission => {
                return permission.type;
            });

            return user;
        });
    },

    async getUserFriends(friendsIds) {
        friendsIds = DAL.getArrayObjectId(friendsIds);

        let usersFilter = {
            $match: { "_id": { $in: friendsIds } }
        };

        let profileImageJoinFilter = {
            $lookup: {
                from: profilePicturesCollectionName,
                localField: 'profile',
                foreignField: '_id',
                as: 'profileImage'
            }
        };

        let permissionsJoinFilter = {
            $lookup:
            {
                from: permissionsCollectionName,
                localField: '_id',
                foreignField: 'members',
                as: 'permissions'
            }
        };

        let aggregateArray = [
            usersFilter,
            profileImageJoinFilter,
            permissionsJoinFilter,
            {
                $project: {
                    fullName: { $concat: ["$firstName", " ", "$lastName"] },
                    fullNameReversed: { $concat: ["$lastName", " ", "$firstName"] },
                    "profileImage.image": 1,
                    "permissions.type": 1
                }
            },
            {
                $sort: { "fullName": 1, "fullNameReversed": 1 }
            }
        ];

        let friends = await DAL.aggregate(usersCollectionName, aggregateArray)
            .catch(errorHandler.promiseError);

        return friends.map(friend => {
            friend.profileImage = (friend.profileImage.length != 0) ?
                friend.profileImage[0].image : null;
            friend.permissions = friend.permissions.map(permission => {
                return permission.type;
            });

            return friend;
        });
    },

    async updateUser(editorUserId, updateFields) {
        let userId = DAL.getObjectId(updateFields._id);

        let isUserMaster = await isUserMaster(userId).catch(errorHandler.promiseError);

        if (isUserMaster) {
            return errorHandler.promiseSecure("The user: " + editorUserId +
                " attemped to edit the master user: " + userId);
        }

        delete updateFields._id;

        // Generate password hash and salt.
        if (updateFields.password) {
            updateFields.uid = generator.generateId();
            updateFields.salt = generator.generateCode(config.security.password.saltSize);
            updateFields.password = sha512(updateFields.password + updateFields.salt);
        }

        let isUpdateValid = true;

        // In case of email update, check the email is not already exists.
        if (updateFields.email) {
            let emailsCount = await DAL.count(usersCollectionName, { "email": updateFields.email })
                .catch(errorHandler.promiseError);

            (emailsCount > 0) && (isUpdateValid = false);
        }

        if (isUpdateValid) {
            let result = await DAL.updateOne(usersCollectionName,
                { "_id": userId },
                { $set: updateFields }).catch(errorHandler.promiseError);

            result && (result = true);
            return { result };
        }
        else {
            return { result: -1 };
        }
    },

    async blockUser(blockerId, blockObj) {
        let blockerObjId = DAL.getObjectId(blockerId);
        let blockedObjId = DAL.getObjectId(blockObj._id);

        let isUserMaster = await isUserMaster(blockedObjId).catch(errorHandler.promiseError);

        if (isUserMaster) {
            return errorHandler.promiseSecure("The user: " + blockerObjId +
                " attempted to block the master user: " + blockedObjId);
        }

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
            unblockDate,
            blockerId: blockerObjId
        };

        let result = await DAL.updateOne(usersCollectionName,
            { "_id": blockedObjId },
            { $set: { block } }).catch(errorHandler.promiseError);

        if (result) {
            mailer.blockMessage(result.email, result.firstName, block.reason, block.unblockDate);
            result = result.block;
        }

        return result;
    },

    async unblockUser(userId) {
        let result = await DAL.updateOne(usersCollectionName,
            { "_id": DAL.getObjectId(userId) },
            { $unset: { "block": 1 } }).catch(errorHandler.promiseError);

        return !!result;
    },

    async removeFriends(currUserId, cardUserId, friendId) {
        let results = await Promise.all([
            isUserMaster(DAL.getObjectId(currUserId)),
            isUserMaster(DAL.getObjectId(cardUserId)),
            isUserMaster(DAL.getObjectId(friendId))
        ]).catch(errorHandler.promiseError);

        let isCurrUserMaster = results[0];
        let isCardUserMaster = results[1];
        let isFrientUserMaster = results[2];

        if (!isCurrUserMaster &&
            (isCardUserMaster || isFrientUserMaster)) {
            return errorHandler.promiseSecure("The user: " + currUserId +
                " attempted to remove friends: " + cardUserId + ", " + friendId);
        }

        return userPageBL.removeFriends(cardUserId, friendId);
    },

    deleteUser(userId, userFirstName, userLastName, userEmail, req) {
        return deleteUserBL.deleteUserFromDB(userId, userFirstName, userLastName, userEmail, req);
    }
};

async function isUserMaster(userId) {
    let userPermissions = await DAL.findSpecific(permissionsCollectionName,
        { "members": userId },
        { "type": 1 }).catch(errorHandler.promiseError);

    return permissionHandler.isUserHasMasterPermission(userPermissions.map(permission => {
        return permission.type;
    }));
}