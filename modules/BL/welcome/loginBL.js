const DAL = require('../../DAL');
const config = require('../../../config');
const sha512 = require('js-sha512');

const errorHandler = require('../../handlers/errorHandler');

const usersCollectionName = config.db.collections.users;
const permissionsCollectionName = config.db.collections.permissions;

module.exports = {
    async getUserById(id) {
        let userFilter = { $match: { "_id": DAL.getObjectId(id) } };
        let joinFilter = {
            $lookup:
            {
                from: permissionsCollectionName,
                localField: '_id',
                foreignField: 'members',
                as: 'permissions'
            }
        };

        let aggregateArray = [userFilter, joinFilter];

        let result = await DAL.aggregate(usersCollectionName, aggregateArray)
            .catch(errorHandler.promiseError);

        if (result.length == 1) {
            let user = result[0];

            user.permissions = user.permissions.map(permission => {
                return permission.type;
            });

            return user;
        }
        else {
            return null;
        }
    },

    async isPasswordMatchToUser(userObjId, password) {
        let user = await DAL.findOneSpecific(usersCollectionName,
            { "_id": userObjId },
            { "password": 1, "salt": 1 }).catch(errorHandler.promiseError);

        if (!user) {
            return null;
        }

        return (sha512(password + user.salt) == user.password);
    },

    async getUser(userAuth) {
        let userFilter = { "email": userAuth.email };

        let user = await DAL.findOne(usersCollectionName, userFilter)
            .catch(errorHandler.promiseError);

        // In case the user email was not found.
        if (!user) {
            return "-1";
        }
        // In case the password is wrong.
        else if (sha512(userAuth.password + user.salt) != user.password) {
            return false;
        }
        // In case the user is blocked.
        else if (this.isUserBlocked(user)) {
            if (user.block.unblockDate) {
                user.block.unblockDate = buildDataStr(user.block.unblockDate);
            }

            return { "block": user.block };
        }
        else {
            delete user.block;

            return user;
        }
    },

    isUserBlocked(user) {
        return (user.block &&
            (!user.block.unblockDate || user.block.unblockDate.getTime() > Date.now()));
    },

    updateLastLogin: (userId) => {
        let findObj = { "_id": DAL.getObjectId(userId) };
        let lastLoginTimeObj = { $set: { "lastLoginTime": new Date() } };

        return DAL.updateOne(usersCollectionName, findObj, lastLoginTimeObj);
    }

};

Date.prototype.addHours = (h) => {
    this.setTime(this.getTime() + (h * 60 * 60 * 1000));

    return this;
};

function buildDataStr(date) {
    return (date.getDate() + '/' +
        (date.getMonth() + 1) + '/' +
        date.getFullYear())
}