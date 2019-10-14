const DAL = require('../../DAL');
const config = require('../../../config');

const errorHandler = require('../../handlers/errorHandler');

const usersCollectionName = config.db.collections.users;

module.exports = {
    async getUserPrivacyStatus(userId) {
        let userFilter = { _id: DAL.getObjectId(userId) };
        let privateField = { isPrivate: 1 };

        let result = await DAL.findOneSpecific(usersCollectionName, userFilter, privateField)
            .catch(errorHandler.promiseError);

        return !!result.isPrivate;
    },

    async setUserPrivacy(userId, isPrivate) {
        let userFilter = { _id: DAL.getObjectId(userId) };
        let userPrivateSet = { $set: { isPrivate } };

        let result = await DAL.updateOne(usersCollectionName, userFilter, userPrivateSet)
            .catch(errorHandler.promiseError);

        return !!result;
    }
};