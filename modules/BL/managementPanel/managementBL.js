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
            searchInput = DAL.GetObjectId(searchInput);
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

        let users = await DAL.Aggregate(usersCollectionName, aggregateArray);

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
            return DAL.GetObjectId(id);
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

        let friends = await DAL.Aggregate(usersCollectionName, aggregateArray);

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
        let userId = DAL.GetObjectId(updateFields._id);

        if (await IsUserMaster(userId)) {
            logger.secure("The user: " + editorUserId + " attemped to edit the master user: " + userId);
            return Promise.reject();
        }

        delete updateFields._id;

        // Generate password hash and salt.
        if (updateFields.password) {
            updateFields.uid = generator.GenerateId();
            updateFields.salt = generator.GenerateCode(config.security.password.saltSize);
            updateFields.password = sha512(updateFields.password + updateFields.salt);
        }

        let result = await DAL.UpdateOne(usersCollectionName,
            { "_id": userId },
            { $set: updateFields });

        result && (result = true);
        return result;
    },

    async BlockUser(blockerId, blockObj) {
        let blockerId = DAL.GetObjectId(blockerId);
        let blockedId = DAL.GetObjectId(blockObj._id);

        if (await IsUserMaster(blockedId)) {
            logger.secure("The user: " + blockerId + " attemped to block the master user: " + blockedId);
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
            blockerId
        }

        let result = await DAL.UpdateOne(usersCollectionName,
            { "_id": blockedId },
            { $set: { block } });

        if (result) {
            mailer.BlockMessage(result.email, result.firstName, block.reason, block.unblockDate);
            result = result.block;
        }

        return result;
    },

    async UnblockUser(userId) {
        let result = await DAL.UpdateOne(usersCollectionName,
            { "_id": DAL.GetObjectId(userId) },
            { $unset: { "block": 1 } });

        return (result ? true : result);
    },

    async RemoveFriends(currUserId, cardUserId, friendId) {
        let isCurrUserMaster = await IsUserMaster(DAL.GetObjectId(currUserId));

        if (!isCurrUserMaster &&
            (await IsUserMaster(DAL.GetObjectId(cardUserId)) ||
                await IsUserMaster(DAL.GetObjectId(friendId)))) {
            return Promise.reject();
        }

        return userPageBL.RemoveFriends(cardUserId, friendId);
    },

    DeleteUser(userId, userFirstName, userLastName) {
        return deleteUserBL.DeleteUserFromDB(userId, userFirstName, userLastName);
    }
};

async function IsUserMaster(userId) {
    let userPermissions = (await DAL.FindSpecific(permissionsCollectionName,
        { "members": userId },
        { "type": 1 })).map(permission => {
            return permission.type;
        });

    return permissionHandler.IsUserHasMasterPermission(userPermissions);
}