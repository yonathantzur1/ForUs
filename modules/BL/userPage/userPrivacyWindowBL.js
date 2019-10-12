const DAL = require('../../DAL');
const config = require('../../../config');

const usersCollectionName = config.db.collections.users;

module.exports = {
    getUserPrivacyStatus: (userId) => {
        return new Promise((resolve, reject) => {
            let userFilter = { _id: DAL.getObjectId(userId) };
            let privateField = { isPrivate: 1 };

            DAL.findOneSpecific(usersCollectionName, userFilter, privateField).then(result => {
                resolve(!!result.isPrivate);
            }).catch(reject);
        });
    },

    setUserPrivacy: (userId, isPrivate) => {
        return new Promise((resolve, reject) => {
            let userFilter = { _id: DAL.getObjectId(userId) };
            let userPrivateSet = { $set: { isPrivate } };

            DAL.updateOne(usersCollectionName, userFilter, userPrivateSet).then(result => {
                resolve(!!result);
            }).catch(reject);
        });
    }
};