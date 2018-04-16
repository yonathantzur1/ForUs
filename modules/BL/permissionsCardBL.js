const DAL = require('../DAL');
const config = require('../config');

const collectionName = config.db.collections.permissions;

module.exports = {
    GetAllPermissions: function (callback) {
        var queryFields = { "type": 1, "name": 1 };

        DAL.FindSpecific(collectionName, {}, queryFields, function (permissions) {
            callback(permissions);
        });
    },

    GetUserPermissions: function (userId, callback) {
        var query = { "members": DAL.GetObjectId(userId) };
        var queryFields = { "type": 1 };

        DAL.FindSpecific(collectionName, query, queryFields, function (permissions) {
            if (permissions) {
                permissions = permissions.map(function (permission) {
                    return permission.type;
                });
            }

            callback(permissions);
        });
    },

    UpdatePermissions: function (userId, permissions, callback) {
        var userObjId = DAL.GetObjectId(userId);

        DAL.Update(collectionName, {}, { $pull: { "members": userObjId } }, function (result) {
            if (result != null) {
                var updateFindQuery = { $or: [] };

                permissions.forEach(permission => {
                    if (permission.isChecked) {
                        updateFindQuery.$or.push({ "_id": DAL.GetObjectId(permission._id) });
                    }
                });

                if (updateFindQuery.$or.length > 0) {
                    DAL.Update(collectionName, updateFindQuery, { $push: { "members": userObjId } }, function (result) {
                        if (result != null) {
                            result = true;
                        }

                        callback(result);
                    });
                }
                else {
                    callback(true);
                }
            }
            else {
                callback(result);
            }
        });
    }
}