const DAL = require('../DAL.js');
const config = require('../../config');

const collectionName = config.db.collections.users;

var self = module.exports = {
    UpdateUserInfo: (updateFields) => {
        return new Promise((resolve, reject) => {
            var userId = DAL.GetObjectId(updateFields._id);
            delete updateFields._id;

            if (updateFields.email) {
                DAL.Count(collectionName, { "email": updateFields.email }).then(amount => {
                    if (amount > 0) {
                        resolve("-1");
                    }
                    else {
                        self.UpdateUserOnDB(resolve, reject, userId, updateFields);
                    }
                }).catch(reject);
            }
            else {
                self.UpdateUserOnDB(resolve, reject, userId, updateFields);
            }
        });
    },

    UpdateUserOnDB: (resolve, reject, userObjectId, updateFields) => {
        DAL.UpdateOne(collectionName,
            { "_id": userObjectId },
            { $set: updateFields }).then((result) => {
                // Change result to true in case the update succeeded.
                result && (result = true);
                resolve(result);
            }).catch(reject);
    }
}