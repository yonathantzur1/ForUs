const tokenHandler = require('../handlers/tokenHandler');
const permissionHandler = require('../handlers/permissionHandler');

module.exports = {
    auth(req, res, next) {
        tokenHandler.validateUserAuthCookies(req) ? next() : res.sendStatus(401);
    },

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