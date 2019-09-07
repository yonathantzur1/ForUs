const DAL = require('../../DAL');
const config = require('../../../config');

const permissionsCollectionName = config.db.collections.permissions;

module.exports = {
    GetAllPermissions() {
        return new Promise((resolve, reject) => {
            let queryFields = { "type": 1, "name": 1 };

            DAL.FindSpecific(permissionsCollectionName, {}, queryFields).then(resolve).catch(reject);
        });
    },

    GetUserPermissions(userId) {
        return new Promise((resolve, reject) => {
            let query = { "members": DAL.GetObjectId(userId) };
            let queryFields = { "type": 1 };

            DAL.FindSpecific(permissionsCollectionName, query, queryFields).then((permissions) => {
                if (permissions) {
                    permissions = permissions.map((permission) => {
                        return permission.type;
                    });
                }

                resolve(permissions);
            }).catch(reject);
        });
    },

    UpdatePermissions(userId, permissions) {
        return new Promise((resolve, reject) => {
            let userObjId = DAL.GetObjectId(userId);

            DAL.Update(permissionsCollectionName, {}, { $pull: { "members": userObjId } }).then((result) => {
                let updateFindQuery = { $or: [] };

                permissions.forEach(permission => {
                    if (permission.isChecked) {
                        updateFindQuery.$or.push({ "_id": DAL.GetObjectId(permission._id) });
                    }
                });

                if (updateFindQuery.$or.length > 0) {
                    DAL.Update(permissionsCollectionName, updateFindQuery, { $push: { "members": userObjId } }).then((result) => {
                        resolve(true);
                    });
                }
                else {
                    resolve(true);
                }
            }).catch(reject);
        });
    }
}