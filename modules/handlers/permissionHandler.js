const enums = require('../enums');

let self = module.exports = {
    IsUserHasMasterPermission(permissionsArray) {
        return CheckPermission(permissionsArray, enums.PERMISSION.MASTER);
    },

    IsUserHasAdminPermission(permissionsArray) {
        return CheckPermission(permissionsArray, enums.PERMISSION.ADMIN);
    },

    IsUserHasRootPermission(permissionsArray) {
        return (self.IsUserHasAdminPermission(permissionsArray) ||
            self.IsUserHasMasterPermission(permissionsArray));
    }
}

function CheckPermission(permissionsArray, permissionType) {
    if (!permissionsArray || permissionsArray.length == 0) {
        return false;
    }
    else {
        return (permissionsArray.indexOf(permissionType) != -1);
    }
}