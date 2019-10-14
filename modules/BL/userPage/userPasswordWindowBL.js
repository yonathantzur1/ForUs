const DAL = require('../../DAL');
const config = require('../../../config');
const USER_UPDATE_INFO_ERROR = require('../../enums').USER_UPDATE_INFO_ERROR;
const generator = require('../../generator');
const sha512 = require('js-sha512');

const loginBL = require('../welcome/loginBL');

const errorHandler = require('../../handlers/errorHandler');

const usersCollectionName = config.db.collections.users;
const saltSize = config.security.password.saltSize;

module.exports = {
    async updateUserPassword(oldPassword, newPassword, userId) {
        let userObjId = DAL.getObjectId(userId);

        let isPasswordMatch = await loginBL.isPasswordMatchToUser(userObjId, oldPassword)
            .catch(errorHandler.promiseError);

        // In case the password math to the user.
        if (!isPasswordMatch) {
            return USER_UPDATE_INFO_ERROR.WRONG_PASSWORD;
        }

        let salt = generator.generateCode(saltSize);
        let findObj = { "_id": userObjId };
        let updateObj = {
            $set: {
                "uid": generator.generateId(),
                "salt": salt,
                "password": sha512(newPassword + salt)
            }
        };

        let updateResult = await DAL.updateOne(usersCollectionName, findObj, updateObj)
            .catch(errorHandler);

        return !!updateResult;
    }
};