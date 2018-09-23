const DAL = require('../../DAL');
const config = require('../../../config');
const enums = require('../../enums');
const sha512 = require('js-sha512');

const collectionName = config.db.collections.users;

var self = module.exports = {
    UpdateUserInfo(updateFields) {
        return new Promise((resolve, reject) => {
            var userObjId = DAL.GetObjectId(updateFields._id);
            var userPassword = updateFields.password;
            delete updateFields._id;
            delete updateFields.password;

            // Check if the validation password match to the user password on DB.
            self.IsPasswordMatchToUser(userObjId, userPassword).then(result => {
                if (result) {
                    // In case email field was updated.
                    if (updateFields.email) {
                        DAL.Count(collectionName, { "email": updateFields.email }).then(amount => {
                            if (amount > 0) {
                                resolve(enums.USER_UPDATE_INFO_ERROR.EMAIL_EXISTS);
                            }
                            else {
                                self.UpdateUserOnDB(resolve, reject, userObjId, updateFields);
                            }
                        }).catch(reject);
                    }
                    else {
                        self.UpdateUserOnDB(resolve, reject, userObjId, updateFields);
                    }
                }
                else {
                    resolve(enums.USER_UPDATE_INFO_ERROR.WRONG_PASSWORD);
                }
            }).catch(reject);
        });
    },

    IsPasswordMatchToUser(userObjId, password) {
        return new Promise((resolve, reject) => {
            DAL.FindOneSpecific(collectionName,
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

    UpdateUserOnDB(resolve, reject, userObjId, updateFields) {
        DAL.UpdateOne(collectionName,
            { "_id": userObjId },
            { $set: updateFields }).then((result) => {
                // Change result to true in case the update succeeded.
                result && (result = true);
                resolve(result);
            }).catch(reject);
    }
}