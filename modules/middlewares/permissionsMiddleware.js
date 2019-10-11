const permissionHandler = require('../handlers/permissionHandler');

module.exports = {
    root(req, res, next) {
        permissionHandler.isUserHasRootPermission(req.user.permissions) ?
            next() : res.sendStatus(401);
    },

    master(req, res, next) {
        permissionHandler.isUserHasMasterPermission(req.user.permissions) ?
            next() : res.sendStatus(401);
    },

    admin(req, res, next) {
        permissionHandler.isUserHasAdminPermission(req.user.permissions) ?
            next() : res.sendStatus(401);
    }
};