const usersReportsBL = require('../../BL/managementPanel/usersReportsBL');
const permissionHandler = require('../../handlers/permissionHandler');

let prefix = "/api/usersReports";

module.exports = function (app) {
    // Root permissions check for all usersReports routes
    app.use(prefix, function (req, res, next) {
        if (permissionHandler.IsUserHasRootPermission(req.user.permissions)) {
            next();
        }
        else {
            res.status(401).end();
        }
    });

    app.get(prefix + '/getAllReports', function (req, res) {
        usersReportsBL.GetAllReports().then((result) => {
            res.send(result);
        }).catch((err) => {
            res.status(500).end();
        });
    });
}