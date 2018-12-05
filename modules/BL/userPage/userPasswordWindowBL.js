const DAL = require('../../DAL');
const config = require('../../../config');
const enums = require('../../enums');
const generator = require('../../generator');
const sha512 = require('js-sha512');

const loginBL = require('../loginBL');

const usersCollectionName = config.db.collections.users;
const saltSize = config.security.password.saltSize;

module.exports = {
    UpdateUserPassword(oldPassword, newPassword, userId) {
        return new Promise((resolve, reject) => {
            var userObjId = DAL.GetObjectId(userId);

            loginBL.IsPasswordMatchToUser(userObjId, oldPassword).then(result => {
                // In case the password math to the user.
                if (result) {
                    var salt = generator.GenerateCode(saltSize);
                    var findObj = { "_id": userObjId };
                    var updateObj = {
                        $set: {
                            "uid": generator.GenerateId(),
                            "salt": salt,
                            "password": sha512(newPassword + salt)
                        }
                    }

                    DAL.UpdateOne(usersCollectionName, findObj, updateObj).then(result => {
                        resolve(true);
                    }).catch(reject);
                }
                else {
                    resolve(enums.USER_UPDATE_INFO_ERROR.WRONG_PASSWORD);
                }
            }).catch(reject);
        });
    }
}