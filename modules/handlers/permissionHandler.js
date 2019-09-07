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
    return (permissionsArray && permissionsArray.indexOf(permissionType) != -1);
}