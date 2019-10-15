const DAL = require('../DAL');
const config = require('../../config');
const generator = require('../generator');
const sha512 = require('js-sha512');

const errorHandler = require('../handlers/errorHandler');

const usersCollectionName = config.db.collections.users;
const saltSize = config.security.password.saltSize;
const resetCodeFreeRetries = config.security.password.resetCode.freeRetries;
const resetCodeTTL = config.security.ttl.resetPasswordCode;

module.exports = {
    // Add reset password code to the DB and return the user.
    setUserResetCode(email) {
        let code = generator.generateCode(config.security.password.resetCode.numOfDigits, true);
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

        return DAL.updateOne(usersCollectionName, { email }, resetCode);
    },

    // Reset user password by code.
    async resetPassword(forgotUser) {
        let emailObj = { "email": forgotUser.email };
        let errorsObj = {
            emailNotFound: false,
            codeNotFound: false,
            codeNotValid: false,
            codeIsExpired: false,
            maxTry: false,
            codeIsUsed: false
        };

        let result = await DAL.find(usersCollectionName, emailObj)
            .catch(errorHandler.promiseError);

        // In case the email was not found.
        if (result.length == 0) {
            errorsObj.emailNotFound = true;
            return errorsObj;
        }
        // In case the code was not found.
        else if (!result[0].resetCode) {
            errorsObj.codeNotFound = true;
            return errorsObj;
        }
        // In case the code is used.
        else if (result[0].resetCode.isUsed) {
            errorsObj.codeIsUsed = true;
            return errorsObj;
        }
        // In case the code is in max try.
        else if (result[0].resetCode.tryNum >= resetCodeFreeRetries) {
            errorsObj.maxTry = true;
            return errorsObj;
        }
        // In case the code is expired.
        else if (new Date(result[0].resetCode.date).addHours(resetCodeTTL).getTime() <
            (new Date()).getTime()) {
            errorsObj.codeIsExpired = true;
            return errorsObj;
        }
        // In case the code is wrong.
        else if (result[0].resetCode.code != forgotUser.code) {
            errorsObj.codeNotValid = true;
            let resetCodeObj = result[0].resetCode;
            resetCodeObj.tryNum++;

            let updateCodeObj = { $set: { "resetCode": resetCodeObj } };

            // Update num of tries to the code.
            let updateResult = await DAL.updateOne(usersCollectionName, emailObj, updateCodeObj)
                .catch(errorHandler.promiseError);

            if (updateResult) {
                return errorsObj;
            }
            else {
                return null;
            }
        }
        // In case the reset code is valid, change the user password.
        else {
            let updateUser = result[0];
            updateUser.uid = generator.generateId();
            updateUser.salt = generator.generateCode(saltSize);
            updateUser.password = sha512(forgotUser.newPassword + updateUser.salt);
            updateUser.resetCode.isUsed = true;
            updateUser.resetCode.tryNum++;

            let updateUserObj = { $set: updateUser };

            let updateResult = DAL.updateOne(usersCollectionName, emailObj, updateUserObj)
                .catch(errorHandler.promiseError);

            if (updateResult) {
                return { "isChanged": true, "user": updateResult };
            }
            else {
                return null;
            }
        }
    },

    validateResetPasswordToken(token) {
        let query = getUserByTokenFilterQuery(token);
        let fields = { "_id": 0, "firstName": 1, "lastName": 1 };

        return DAL.findOneSpecific(usersCollectionName, query, fields);
    },

    // Reset user password by token.
    resetPasswordByToken(data) {
        let token = data.token;
        let newPassword = data.newPassword;
        let salt = generator.generateCode(saltSize);

        let findObj = getUserByTokenFilterQuery(token);

        let updateObj = {
            $set: {
                "uid": generator.generateId(),
                "salt": salt,
                "password": sha512(newPassword + salt),
                "resetCode.isUsed": true
            }
        };

        return DAL.updateOne(usersCollectionName, findObj, updateObj);
    }
};

// Return mongo query object to find user by reset password token string.
function getUserByTokenFilterQuery(token) {
    let currDate = new Date();
    let resetDateObjectRuleForQuery = {
        $gte: currDate.addHours(resetCodeTTL * -1)
    };

    return {
        "resetCode.token": token,
        "resetCode.isUsed": false,
        "resetCode.tryNum": { $lt: resetCodeFreeRetries },
        "resetCode.date": resetDateObjectRuleForQuery
    };
}