const permissionsBL = require('../../BL/managementPanel/permissionsBL');
const permissionHandler = require('../../handlers/permissionHandler');
const logger = require('../../../logger');

let prefix = "/api/permissions";

module.exports = function (app) {    
    // Master permissions check for all management routes
    app.use(prefix, function (req, res, next) {
        if (permissionHandler.IsUserHasMasterPermission(req.user.permissions)) {
            next();
        }
        else {
            res.status(401).end();
        }
    });

    app.get(prefix + '/getAllPermissions', function (req, res) {
        permissionsBL.GetAllPermissions().then((result) => {
            res.send(result);
        }).catch((err) => {
            logger.error(err);
            res.status(500).end();
        });
    });

    app.get(prefix + '/getUserPermissions', function (req, res) {
        permissionsBL.GetUserPermissions(req.query.userId).then((result) => {
            res.send(result);
        }).catch((err) => {
            logger.error(err);
            res.status(500).end();
        });
    });

    app.put(prefix + '/updatePermissions', function (req, res) {
        permissionsBL.UpdatePermissions(req.body.userId, req.body.permissions).then((result) => {
            res.send(result);
        }).catch((err) => {
            logger.error(err);
            res.status(500).end();
        });
    });
}