const permissionsCardBL = require('../modules/BL/permissionsCardBL');
const general = require('../modules/general');

module.exports = function (app) {
    prefix = "/api/permissionsCard";

    // Master permissions check for all management routes
    app.use(prefix, function (req, res, next) {
        if (general.IsUserHasMasterPermission(req.user.permissions)) {
            next();
        }
        else {
            res.status(401).end();
        }
    });

    app.get(prefix + '/getAllPermissions', function (req, res) {
        permissionsCardBL.GetAllPermissions().then((result) => {
            res.send(result);
        }).catch((err) => {
            res.status(500).end();
        });
    });

    app.get(prefix + '/getUserPermissions', function (req, res) {
        permissionsCardBL.GetUserPermissions(req.query.userId).then((result) => {
            res.send(result);
        }).catch((err) => {
            res.status(500).end();
        });
    });

    app.put(prefix + '/updatePermissions', function (req, res) {
        permissionsCardBL.UpdatePermissions(req.body.userId, req.body.permissions).then((result) => {
            res.send(result);
        }).catch((err) => {
            res.status(500).end();
        });
    });
}