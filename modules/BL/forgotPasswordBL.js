const DAL = require('../DAL');
const config = require('../../config');
const generator = require('../generator');
const sha512 = require('js-sha512');

const usersCollectionName = config.db.collections.users;
const saltSize = config.security.password.saltSize;
const resetCodeTTL = config.security.password.resetCode.codeTTL;
const resetCodeFreeRetries = config.security.password.resetCode.freeRetries;

module.exports = {
    // Add reset password code to the DB and return the user.
    SetUserResetCode(email) {
        return new Promise((resolve, reject) => {
            let code = generator.GenerateCode(config.security.password.resetCode.numOfDigits, true);
            let resetPasswordToken = sha512(email + code);

            let resetCode = {
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

            DAL.UpdateOne(usersCollectionName, { email }, resetCode).then(resolve).catch(reject);
        });
    },

    // Reset user password by code.
    ResetPassword(forgotUser) {
        return new Promise((resolve, reject) => {
            let emailObj = { "email": forgotUser.email };
            let errorsObj = {
                emailNotFound: false,
                codeNotFound: false,
                codeNotValid: false,
                codeIsExpired: false,
                maxTry: false,
                codeIsUsed: false
            };

            DAL.Find(usersCollectionName, emailObj).then((result) => {
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
                else if (new Date(result[0].resetCode.date).addHours(resetCodeTTL).getTime() < (new Date()).getTime()) {
                    errorsObj.codeIsExpired = true;
                    resolve(errorsObj);
                }
                // In case the code is wrong.
                else if (result[0].resetCode.code != forgotUser.code) {
                    errorsObj.codeNotValid = true;
                    let resetCodeObj = result[0].resetCode;
                    resetCodeObj.tryNum++;

                    let updateCodeObj = { $set: { "resetCode": resetCodeObj } };

                    // Update num of tries to the code.
                    DAL.UpdateOne(usersCollectionName, emailObj, updateCodeObj).then((updateResult) => {
                        updateResult ? resolve(errorsObj) : resolve(updateResult);
                    });
                }
                // In case the reset code is valid, change the user password.
                else {
                    let updateUser = result[0];
                    updateUser.uid = generator.GenerateId();
                    updateUser.salt = generator.GenerateCode(saltSize);
                    updateUser.password = sha512(forgotUser.newPassword + updateUser.salt);
                    updateUser.resetCode.isUsed = true;
                    updateUser.resetCode.tryNum++;

                    updateUserObj = { $set: updateUser };

                    DAL.UpdateOne(usersCollectionName, emailObj, updateUserObj).then((updateResult) => {
                        updateResult ? resolve({ "isChanged": true, "user": updateResult }) : resolve(updateResult);
                    });
                }
            }).catch(reject);
        });
    },

    ValidateResetPasswordToken(token) {
        return new Promise((resolve, reject) => {
            let query = GetUserByTokenFilterQuery(token);
            let fields = { "_id": 0, "firstName": 1, "lastName": 1 };

            DAL.FindOneSpecific(usersCollectionName, query, fields).then(resolve).catch(reject);
        });
    },

    // Reset user password by token.
    ResetPasswordByToken(data) {
        return new Promise((resolve, reject) => {
            let token = data.token;
            let newPassword = data.newPassword;
            let salt = generator.GenerateCode(saltSize);

            let findObj = GetUserByTokenFilterQuery(token);

            let updateObj = {
                $set: {
                    "uid": generator.GenerateId(),
                    "salt": salt,
                    "password": sha512(newPassword + salt),
                    "resetCode.isUsed": true
                }
            }

            DAL.UpdateOne(usersCollectionName, findObj, updateObj).then(result => {
                resolve(result);
            }).catch(reject);
        });
    }
}

// Return mongo query object to find user by reset password token string.
function GetUserByTokenFilterQuery(token) {
    let currDate = new Date();
    let resetDateObjectRuleForQuery = {
        $gte: currDate.addHours(resetCodeTTL * -1)
    }

    let query = {
        "resetCode.token": token,
        "resetCode.isUsed": false,
        "resetCode.tryNum": { $lt: resetCodeFreeRetries },
        "resetCode.date": resetDateObjectRuleForQuery
    }

    return query;
}