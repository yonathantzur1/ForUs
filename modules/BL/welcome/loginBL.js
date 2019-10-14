const DAL = require('../../DAL');
const config = require('../../../config');
const sha512 = require('js-sha512');

const usersCollectionName = config.db.collections.users;
const permissionsCollectionName = config.db.collections.permissions;

let self = module.exports = {

    getUserById(id) {
        return new Promise((resolve, reject) => {
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

            DAL.aggregate(usersCollectionName, aggregateArray).then((result) => {
                if (result.length > 0) {
                    let user = result[0];

                    user.permissions = user.permissions.map(permission => {
                        return permission.type;
                    });

                    resolve(user);
                }
                else {
                    resolve(null);
                }
            }).catch(reject);
        });
    },

    isPasswordMatchToUser(userObjId, password) {
        return new Promise((resolve, reject) => {
            DAL.findOneSpecific(usersCollectionName,
                { "_id": userObjId },
                { "password": 1, "salt": 1 }).then(data => {
                    if (data) {
                        resolve(sha512(password + data.salt) == data.password);
                    }
                    else {
                        resolve(null);
                    }
                }).catch(reject);
        });
    },

    getUser(user) {
        return new Promise((resolve, reject) => {
            let filter = { "email": user.email };

            DAL.findOne(usersCollectionName, filter).then((userObj) => {
                // In case the user was found.
                if (userObj) {
                    // In case the password and salt hashing are the password hash in the DB.
                    if (sha512(user.password + userObj.salt) == userObj.password) {
                        // In case the user is blocked.
                        if (self.isUserBlocked(userObj)) {
                            if (userObj.block.unblockDate) {
                                let unblockDate = userObj.block.unblockDate;
                                unblockDate = unblockDate.getDate() + '/' + (unblockDate.getMonth() + 1) + '/' + unblockDate.getFullYear();
                                userObj.block.unblockDate = unblockDate;
                            }

                            resolve({ "block": userObj.block });
                        }
                        else {
                            delete userObj.block;
                            resolve(userObj);
                        }
                    }
                    // In case the password is incorrect.
                    else {
                        resolve(false);
                    }
                }
                // In case the user was not found.
                else {
                    resolve("-1");
                }
            }).catch(reject);
        });
    },

    isUserBlocked(user) {
        return (user.block &&
            (!user.block.unblockDate || user.block.unblockDate.getTime() > Date.now()));
    },

    updateLastLogin: (userId) => {
        return new Promise((resolve, reject) => {
            let findObj = { "_id": DAL.getObjectId(userId) };
            let lastLoginTimeObj = { $set: { "lastLoginTime": new Date() } };

            DAL.updateOne(usersCollectionName, findObj, lastLoginTimeObj).then(resolve).catch(reject);
        });
    }

};

Date.prototype.addHours = function (h) {
    this.setTime(this.getTime() + (h * 60 * 60 * 1000));

    return this;
};