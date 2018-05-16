const statisticsBL = require('../modules/BL/statisticsBL');
const general = require('../modules/general');

module.exports = function (app) {

    prefix = "/api/statistics";

    // Admin permissions check for all management routes
    app.use(prefix, function (req, res, next) {
        if (general.IsUserHasRootPermission(req.user.permissions)) {
            next();
        }
        else {
            res.status(401).end();
        }
    });

    // ---------- Get graphs data ----------

    app.get(prefix + '/getLoginsData', function (req, res) {

    });

    app.get(prefix + '/getLoginFailsData', function (req, res) {

    });

    app.get(prefix + '/getResetPasswordRequestsData', function (req, res) {

    });

};