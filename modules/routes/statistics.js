const statisticsBL = require('../BL/statisticsBL');
const general = require('../general');

module.exports = function (app) {

    prefix = "/api/statistics";

    // Root permissions check for all management routes
    app.use(prefix, function (req, res, next) {
        if (general.IsUserHasRootPermission(req.user.permissions)) {
            next();
        }
        else {
            res.status(401).end();
        }
    });    

    app.post(prefix + '/getChartData', function (req, res) {
        statisticsBL.GetLoginsData(req.body.logType, req.body.range, req.body.datesRange, req.body.email).then(result => {
            res.send(result);
        }).catch(err => {
            res.status(500).end();
        });
    });

    app.get(prefix + '/getUserByEmail', function (req, res) {
        statisticsBL.GetUserByEmail(req.query.email).then(result => {
            // Return -1 in case the user is not found (result is null).
            res.send(result || "-1");
        }).catch(err => {
            res.status(500).end();
        });
    });
};