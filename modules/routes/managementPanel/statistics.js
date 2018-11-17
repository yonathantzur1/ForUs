const statisticsBL = require('../../BL/managementPanel/statisticsBL');
const permissionHandler = require('../../handlers/permissionHandler');
const general = require('../../general');

var prefix = "/api/statistics";

module.exports = function (app) {
    // Root permissions check for all statistics routes
    app.use(prefix, function (req, res, next) {
        if (permissionHandler.IsUserHasRootPermission(req.user.permissions)) {
            next();
        }
        else {
            res.status(401).end();
        }
    });

    app.post(prefix + '/getChartData',
        (req, res, next) => {
            if (req.body.email) {
                general.LowerStringInObject(req, "body.email");
            }

            next();
        },
        (req, res) => {
            statisticsBL.GetLoginsData(req.body.logType,
                req.body.range,
                req.body.datesRange,
                req.body.clientTimeZone,
                req.body.email).then(result => {
                    res.send(result);
                }).catch(err => {
                    res.status(500).end();
                });
        });

    app.get(prefix + '/getUserByEmail',
        (req, res, next) => {
            general.LowerStringInObject(req, "query.email");
            next();
        },
        (req, res) => {
            statisticsBL.GetUserByEmail(req.query.email).then(result => {
                // Return -1 in case the user is not found (result is null).
                res.send(result || "-1");
            }).catch(err => {
                res.status(500).end();
            });
        });
};