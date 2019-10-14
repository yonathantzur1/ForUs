const DAL = require('../../DAL');
const config = require('../../../config');
const USER_UPDATE_INFO_ERROR = require('../../enums').USER_UPDATE_INFO_ERROR;

const loginBL = require('../welcome/loginBL');

const errorHandler = require('../../handlers/errorHandler');

const usersCollectionName = config.db.collections.users;

module.exports = {
    async updateUserInfo(updateFields) {
        let userObjId = DAL.getObjectId(updateFields._id);
        let userPassword = updateFields.password;
        delete updateFields._id;
        delete updateFields.password;

        // Check if the validation password match to the user password on DB.
        let isPasswordMatchToUser = await loginBL.isPasswordMatchToUser(userObjId, userPassword)
            .catch(errorHandler.promiseError);

        if (!isPasswordMatchToUser) {
            return USER_UPDATE_INFO_ERROR.WRONG_PASSWORD;
        }

        // In case email field was updated.
        if (updateFields.email) {
            let emailCounter = await DAL.count(usersCollectionName, { "email": updateFields.email })
                .catch(errorHandler.promiseError);

            if (emailCounter > 0) {
                return USER_UPDATE_INFO_ERROR.EMAIL_EXISTS;
            }
        }

        let updateResult = await DAL.updateOne(usersCollectionName,
            { "_id": userObjId },
            { $set: updateFields }).catch(errorHandler.promiseError);

        return !!updateResult
    }
};