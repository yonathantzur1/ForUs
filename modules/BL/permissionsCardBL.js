const DAL = require('../DAL');
const config = require('../../config');

const collectionName = config.db.collections.permissions;

module.exports = {
    GetAllPermissions: () => {
        return new Promise((resolve, reject) => {
            var queryFields = { "type": 1, "name": 1 };

            DAL.FindSpecific(collectionName, {}, queryFields).then(resolve).catch(reject);
        });
    },

    GetUserPermissions: (userId) => {
        return new Promise((resolve, reject) => {
            var query = { "members": DAL.GetObjectId(userId) };
            var queryFields = { "type": 1 };

            DAL.FindSpecific(collectionName, query, queryFields).then((permissions) => {
                if (permissions) {
                    permissions = permissions.map((permission) => {
                        return permission.type;
                    });
                }

                resolve(permissions);
            }).catch(reject);
        });
    },

    UpdatePermissions: (userId, permissions) => {
        return new Promise((resolve, reject) => {
            var userObjId = DAL.GetObjectId(userId);

            DAL.Update(collectionName, {}, { $pull: { "members": userObjId } }).then((result) => {
                var updateFindQuery = { $or: [] };

                permissions.forEach(permission => {
                    if (permission.isChecked) {
                        updateFindQuery.$or.push({ "_id": DAL.GetObjectId(permission._id) });
                    }
                });

                if (updateFindQuery.$or.length > 0) {
                    DAL.Update(collectionName, updateFindQuery, { $push: { "members": userObjId } }).then((result) => {
                        resolve(true);
                    }).catch(reject);
                }
                else {
                    resolve(true);
                }
            }).catch(reject);
        });
    }
}