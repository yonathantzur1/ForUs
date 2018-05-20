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

    app.post(prefix + '/getChartData', function (req, res) {
        statisticsBL.GetLoginsData(req.body.logType, req.body.range, req.body.datesRange, req.body.email).then(result => {
            res.send(result);
        }).catch(err => {
            res.status(500).end();
        });
    });
};