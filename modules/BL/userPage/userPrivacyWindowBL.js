const DAL = require('../../DAL');
const config = require('../../../config');

const collectionName = config.db.collections.users;

module.exports = {

    GetUserPrivacyStatus: (userId) => {
        return new Promise((resolve, reject) => {
            var userFilter = { _id: DAL.GetObjectId(userId) };
            var privateField = { isPrivate: 1 };

            DAL.FindOneSpecific(collectionName, userFilter, privateField).then(result => {
                resolve(result.isPrivate ? true : false);
            }).catch(reject);
        });
    },

    SetUserPrivacy: (userId, isPrivate) => {
        return new Promise((resolve, reject) => {
            var userFilter = { _id: DAL.GetObjectId(userId) };            
            var userPrivateSet = { $set: { isPrivate } };

            DAL.UpdateOne(collectionName, userFilter, userPrivateSet).then(result => {
                resolve(result ? true : false);
            }).catch(reject);
        });
    }

}