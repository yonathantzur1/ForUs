const enums = require('../enums');

let self = module.exports = {
    IsUserHasMasterPermission(permissionsArray) {
        return IsUserHasPermission(permissionsArray, enums.PERMISSION.MASTER);
    },

    IsUserHasAdminPermission(permissionsArray) {
        return IsUserHasPermission(permissionsArray, enums.PERMISSION.ADMIN);
    },

    IsUserHasRootPermission(permissionsArray) {
        return (self.IsUserHasAdminPermission(permissionsArray) ||
            self.IsUserHasMasterPermission(permissionsArray));
    }
}

function IsUserHasPermission(permissionsArray, permissionType) {
    if (!permissionsArray || permissionsArray.length == 0) {
        return false;
    }
    else {
        return (permissionsArray.indexOf(permissionType) != -1);
    }
}