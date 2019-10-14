const DAL = require('../../DAL');
const config = require('../../../config');

const errorHandler = require('../../handlers/errorHandler');

const permissionsCollectionName = config.db.collections.permissions;

module.exports = {
    getAllPermissions() {
        let queryFields = { "type": 1, "name": 1 };

        return DAL.findSpecific(permissionsCollectionName, {}, queryFields)
    },

    async getUserPermissions(userId) {
        let query = { "members": DAL.getObjectId(userId) };
        let queryFields = { "type": 1 };

        let permissions = await DAL.findSpecific(permissionsCollectionName, query, queryFields)
            .catch(errorHandler.promiseError);

        return permissions.map((permission) => {
            return permission.type;
        });
    },

    async updatePermissions(userId, permissions) {
        let userObjId = DAL.getObjectId(userId);

        // Remove all user permissions.
        await DAL.update(permissionsCollectionName, {}, { $pull: { "members": userObjId } })
            .catch(errorHandler.promiseError);

        permissions = permissions.filter(permission => {
            return permission.isChecked;
        }).map(permission => {
            return { "_id": DAL.getObjectId(permission._id) };
        })

        if (permissions.length > 0) {
            let updateFindQuery = { $or: permissions };

            // Add permissions to the user.
            await DAL.update(permissionsCollectionName, updateFindQuery, { $push: { "members": userObjId } })
                .catch(errorHandler.promiseError)
        }

        return true;
    }
};