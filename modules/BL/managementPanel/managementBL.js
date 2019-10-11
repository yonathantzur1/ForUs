const DAL = require('../../DAL');
const config = require('../../../config');
const generator = require('../../generator');
const mailer = require('../../mailer');
const logger = require('../../../logger');
const sha512 = require('js-sha512');
const permissionHandler = require('../../handlers/permissionHandler')

const userPageBL = require('../userPage/userPageBL');
const deleteUserBL = require('../deleteUserBL');

const usersCollectionName = config.db.collections.users;
const permissionsCollectionName = config.db.collections.permissions;
const profilePicturesCollectionName = config.db.collections.profilePictures;

module.exports = {
    async GetUserByName(searchInput) {
        // In case the input is empty, return empty result array.
        if (!searchInput) {
            return resolve([]);
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
        }

        let permissionsJoinFilter = {
            $lookup:
            {
                from: permissionsCollectionName,
                localField: '_id',
                foreignField: 'members',
                as: 'permissions'
            }
        }

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

        let users = await DAL.aggregate(usersCollectionName, aggregateArray);

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

    async GetUserFriends(friendsIds) {
        friendsIds = friendsIds.map((id) => {
            return DAL.getObjectId(id);
        });

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
        }

        let permissionsJoinFilter = {
            $lookup:
            {
                from: permissionsCollectionName,
                localField: '_id',
                foreignField: 'members',
                as: 'permissions'
            }
        }

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

        let friends = await DAL.aggregate(usersCollectionName, aggregateArray);

        return friends.map(friend => {
            friend.profileImage = (friend.profileImage.length != 0) ?
                friend.profileImage[0].image : null;
            friend.permissions = friend.permissions.map(permission => {
                return permission.type;
            });

            return friend;
        });
    },

    async UpdateUser(editorUserId, updateFields) {
        let userId = DAL.getObjectId(updateFields._id);

        if (await IsUserMaster(userId)) {
            logger.secure("The user: " + editorUserId + " attemped to edit the master user: " + userId);
            return Promise.reject();
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
            let emailsCount = await DAL.count(usersCollectionName, { "email": updateFields.email });
            (emailsCount > 0) && (isUpdateValid = false);
        }

        if (isUpdateValid) {
            let result = await DAL.updateOne(usersCollectionName,
                { "_id": userId },
                { $set: updateFields });

            result && (result = true);
            return { result };
        }
        else {
            return { result: -1 };
        }
    },

    async BlockUser(blockerId, blockObj) {
        let blockerObjId = DAL.getObjectId(blockerId);
        let blockedObjId = DAL.getObjectId(blockObj._id);

        if (await IsUserMaster(blockedObjId)) {
            logger.secure("The user: " + blockerObjId + " attemped to block the master user: " + blockedObjId);
            return Promise.reject();
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
        }

        let result = await DAL.updateOne(usersCollectionName,
            { "_id": blockedObjId },
            { $set: { block } });

        if (result) {
            mailer.blockMessage(result.email, result.firstName, block.reason, block.unblockDate);
            result = result.block;
        }

        return result;
    },

    async UnblockUser(userId) {
        let result = await DAL.updateOne(usersCollectionName,
            { "_id": DAL.getObjectId(userId) },
            { $unset: { "block": 1 } });

        return (result ? true : result);
    },

    async RemoveFriends(currUserId, cardUserId, friendId) {
        let isCurrUserMaster = await IsUserMaster(DAL.getObjectId(currUserId));

        if (!isCurrUserMaster &&
            (await IsUserMaster(DAL.getObjectId(cardUserId)) ||
                await IsUserMaster(DAL.getObjectId(friendId)))) {
            return Promise.reject();
        }

        return userPageBL.RemoveFriends(cardUserId, friendId);
    },

    DeleteUser(userId, userFirstName, userLastName, userEmail, req) {
        return deleteUserBL.DeleteUserFromDB(userId, userFirstName, userLastName, userEmail, req);
    }
};

async function IsUserMaster(userId) {
    let userPermissions = (await DAL.findSpecific(permissionsCollectionName,
        { "members": userId },
        { "type": 1 })).map(permission => {
            return permission.type;
        });

    return permissionHandler.isUserHasMasterPermission(userPermissions);
}