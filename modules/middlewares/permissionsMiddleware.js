const permissionHandler = require('../handlers/permissionHandler');

module.exports = {
    Root(req, res, next) {
        permissionHandler.IsUserHasRootPermission(req.user.permissions) ?
            next() : res.sendStatus(401);
    },

    Master(req, res, next) {
        permissionHandler.IsUserHasMasterPermission(req.user.permissions) ?
            next() : res.sendStatus(401);
    },

    Admin(req, res, next) {
        permissionHandler.IsUserHasAdminPermission(req.user.permissions) ?
            next() : res.sendStatus(401);
    }
}