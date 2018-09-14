const DAL = require('../DAL');
const config = require('../../config');
const general = require('../general');
const sha512 = require('js-sha512');

const collectionName = config.db.collections.users;
const saltSize = config.security.loginSecure.saltSize;
const resetCodeNumOfDigits = config.security.loginSecure.resetCodeNumOfDigits;
const resetCodeNumOfHoursValid = config.security.loginSecure.resetCodeNumOfHoursValid;
const resetCodeFreeRetries = config.security.loginSecure.resetCodeFreeRetries;

module.exports = {
    // Add reset password code to the DB and return the user.
    SetUserResetCode: (email) => {
        return new Promise((resolve, reject) => {
            var code = general.GenerateCode(resetCodeNumOfDigits, true);
            var resetPasswordToken = sha512(email + code);

            var resetCode = {
                $set: {
                    "resetCode":
                    {
                        "code": code,
                        "token": resetPasswordToken,
                        "date": new Date(),
                        "tryNum": 0,
                        "isUsed": false
                    }
                }
            };

            DAL.UpdateOne(collectionName, { email }, resetCode).then(resolve).catch(reject);
        });
    },

    // Reset user password by code.
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
                if (!result) {
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
                else if (result[0].resetCode.tryNum >= resetCodeFreeRetries) {
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
                    updateUser.salt = general.GenerateCode(saltSize);
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
    },

    ValidateResetPasswordToken: (token) => {
        return new Promise((resolve, reject) => {
            var query = GetUserByTokenFilterQuery(token);
            var fields = { "_id": 0, "firstName": 1, "lastName": 1 };

            DAL.FindOneSpecific(collectionName, query, fields).then(resolve).catch(reject);
        });
    },

    // Reset user password by token.
    ResetPasswordByToken: (data) => {
        return new Promise((resolve, reject) => {
            var token = data.token;
            var newPassword = data.newPassword;
            var salt = general.GenerateCode(saltSize);

            var findObj = GetUserByTokenFilterQuery(token);

            var updateObj = {
                $set: {
                    "uid": general.GenerateId(),
                    "salt": salt,
                    "password": sha512(newPassword + salt),
                    "resetCode.isUsed": true
                }
            }

            DAL.UpdateOne(collectionName, findObj, updateObj).then(result => {
                resolve(result);
            }).catch(reject);
        });
    }
}

function GetUserByTokenFilterQuery(token) {
    var currDate = new Date();
    var resetDateObjectRuleForQuery = {
        $gte: currDate.addHours(resetCodeNumOfHoursValid * -1)
    }

    var query = {
        "resetCode.token": token,
        "resetCode.isUsed": false,
        "resetCode.tryNum": { $lt: resetCodeFreeRetries },
        "resetCode.date": resetDateObjectRuleForQuery
    }

    return query;
}