const enums = require('../enums');

module.exports = {
    isUserHasMasterPermission(permissionsArray) {
        return checkPermission(permissionsArray, enums.PERMISSION.MASTER);
    },

    isUserHasAdminPermission(permissionsArray) {
        return checkPermission(permissionsArray, enums.PERMISSION.ADMIN);
    },

    isUserHasRootPermission(permissionsArray) {
        return (this.isUserHasAdminPermission(permissionsArray) ||
            this.isUserHasMasterPermission(permissionsArray));
    }
};

function checkPermission(permissionsArray, permissionType) {
    return (permissionsArray && permissionsArray.indexOf(permissionType) != -1);
}