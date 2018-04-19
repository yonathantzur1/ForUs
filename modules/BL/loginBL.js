const DAL = require('../DAL');
const config = require('../config');
const general = require('../general');
const generator = require('../generator');
const sha512 = require('js-sha512');

const collectionName = config.db.collections.users;
const permissionsCollectionName = config.db.collections.permissions;
const saltNumOfDigits = config.loginSecure.saltNumOfDigits;
const resetCodeNumOfDigits = config.loginSecure.resetCodeNumOfDigits;
const resetCodeNumOfHoursValid = config.loginSecure.resetCodeNumOfHoursValid;
const resetPasswordMaxTries = config.loginSecure.resetPasswordMaxTries;

var self = module.exports = {

    GetUserById: (id) => {
        return new Promise((resolve, reject) => {
            var userFilter = { $match: { "_id": DAL.GetObjectId(id) } };
            var joinFilter = {
                $lookup:
                    {
                        from: permissionsCollectionName,
                        localField: '_id',
                        foreignField: 'members',
                        as: 'permissions'
                    }
            }

            // Remove unnecessary fields. 
            var userFileds = { $project: { "permissions._id": 0, "permissions.members": 0 } };

            var aggregateArray = [userFilter, joinFilter, userFileds];

            DAL.Aggregate(collectionName, aggregateArray).then((result) => {
                if (result.length > 0) {
                    var user = result[0];

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

    // Return user object on login if the user was found else false.
    GetUser: (user) => {
        return new Promise((resolve, reject) => {
            var filter = { "email": user.email };

            DAL.Find(collectionName, filter).then((result) => {
                // In case of error or more then one user, return null.
                if (result.length > 1) {
                    resolve(null);
                }
                // In case the user was found.
                else if (result.length == 1) {
                    var userObj = result[0];

                    // In case the password and salt hashing are the password hash in the db
                    if (sha512(user.password + userObj.salt) == userObj.password) {
                        // In case the user is blocked.
                        if (self.IsUserBlocked(userObj)) {
                            if (userObj.block.unblockDate) {
                                var unblockDate = userObj.block.unblockDate;
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

    IsUserBlocked: (user) => {
        return (user.block &&
            (!user.block.unblockDate || user.block.unblockDate.getTime() > Date.now()));
    },

    UpdateLastLogin: (userId) => {
        return new Promise((resolve, reject) => {
            var findObj = { "_id": DAL.GetObjectId(userId) };
            var lastLoginTimeObj = { $set: { "lastLoginTime": new Date() } };

            DAL.UpdateOne(collectionName, findObj, lastLoginTimeObj).then(resolve).catch(reject);
        });
    },

    // Check if user is exists on DB.
    CheckIfUserExists: (email) => {
        return new Promise((resolve, reject) => {
            DAL.Find(collectionName, email).then((result) => {
                // In case user was not found.
                if (result.length == 0) {
                    resolve(false);
                }
                // In case the user was found.
                else {
                    resolve(true);
                }
            }).catch(reject);
        });
    },

    // Add user to the DB.
    AddUser: (newUser) => {
        return new Promise((resolve, reject) => {
            if (ValidateUserObject(newUser)) {
                var salt = generator.GenerateCode(saltNumOfDigits);
                newUser.password = sha512(newUser.password + salt);

                // Creat the new user object.
                var newUserObj = {
                    "uid": general.GenerateId(),
                    "firstName": newUser.firstName,
                    "lastName": newUser.lastName,
                    "email": newUser.email,
                    "password": newUser.password,
                    "salt": salt,
                    "creationDate": new Date(),
                    "friends": [],
                    "friendRequests": {
                        "get": [],
                        "send": [],
                        "accept": []
                    }
                };

                DAL.Insert(collectionName, newUserObj).then((result) => {
                    if (result) {
                        newUserObj._id = result;
                        resolve(newUserObj);
                    }
                    else {
                        resolve(result);
                    }
                }).catch(reject);
            }
            else {
                resolve(null);
            }
        });
    },

    // Add reset password code to the DB and return the name of the user.
    SetUserResetCode: (emailObj) => {
        return new Promise((resolve, reject) => {
            var code = generator.GenerateCode(resetCodeNumOfDigits, true);

            var resetCode = {
                $set: {
                    "resetCode":
                        {
                            "code": code,
                            "date": new Date(),
                            "tryNum": 0,
                            "isUsed": false
                        }
                }
            };

            DAL.UpdateOne(collectionName, emailObj, resetCode).then(resolve).catch(reject);
        });
    },

    // Rest password of the user.
    ResetPassword: (forgotUser) => {
        return new Promise((resolve, reject) => {
            var emailObj = { "email": forgotUser.email };
            var errorsObj = {
                emailNotFound: false,
                codeNotFound: false,
                codeNotValid: false,
                codeIsExpired: false,
                maxTry: false,
                codeIsUsed: false
            };

            DAL.Find(collectionName, emailObj).then((result) => {
                if (result.length > 1) {
                    resolve(null);
                }
                // In case the email was not found.
                else if (result.length == 0) {
                    errorsObj.emailNotFound = true;
                    resolve(errorsObj);
                }
                // In case the code was not found.
                else if (!result[0].resetCode) {
                    errorsObj.codeNotFound = true;
                    resolve(errorsObj);
                }
                // In case the code is used.
                else if (result[0].resetCode.isUsed) {
                    errorsObj.codeIsUsed = true;
                    resolve(errorsObj);
                }
                // In case the code is in max try.
                else if (result[0].resetCode.tryNum >= resetPasswordMaxTries) {
                    errorsObj.maxTry = true;
                    resolve(errorsObj);
                }
                // In case the code is expired.
                else if (new Date(result[0].resetCode.date).addHours(resetCodeNumOfHoursValid).getTime() < (new Date()).getTime()) {
                    errorsObj.codeIsExpired = true;
                    resolve(errorsObj);
                }
                // In case the code is wrong.
                else if (result[0].resetCode.code != forgotUser.code) {
                    errorsObj.codeNotValid = true;
                    var resetCodeObj = result[0].resetCode;
                    resetCodeObj.tryNum++;

                    var updateCodeObj = { $set: { "resetCode": resetCodeObj } };

                    // Update num of tries to the code.
                    DAL.UpdateOne(collectionName, emailObj, updateCodeObj).then((updateResult) => {
                        updateResult ? resolve(errorsObj) : resolve(updateResult);
                    }).catch(reject);
                }
                // In case the reset code is valid, change the user password.
                else {
                    var updateUser = result[0];
                    updateUser.uid = general.GenerateId();
                    updateUser.salt = generator.GenerateCode(saltNumOfDigits);
                    updateUser.password = sha512(forgotUser.newPassword + updateUser.salt);
                    updateUser.resetCode.isUsed = true;
                    updateUser.resetCode.tryNum++;

                    updateUserObj = { $set: updateUser };

                    DAL.UpdateOne(collectionName, emailObj, updateUserObj).then((updateResult) => {
                        updateResult ? resolve({ "isChanged": true, "user": updateResult }) : resolve(updateResult);
                    });
                }
            }).catch(reject);
        });
    }

};

Date.prototype.addHours = function (h) {
    this.setTime(this.getTime() + (h * 60 * 60 * 1000));

    return this;
}

function ValidateUserObject(userObj) {
    return (typeof userObj.firstName == "string" &&
        typeof userObj.lastName == "string" &&
        typeof userObj.email == "string" &&
        typeof userObj.password == "string" &&
        userObj.firstName.length <= 10 &&
        userObj.lastName.length <= 10);
}