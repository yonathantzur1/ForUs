const router = require('express').Router();
const statisticsBL = require('../../BL/managementPanel/statisticsBL');
const errorHandler = require('../../handlers/errorHandler');

router.post('/getChartData',
    (req, res, next) => {
        if (req.body.email) {
            req.body.email = req.body.email.toLowerCase();
        }

        next();
    },
    (req, res) => {
        statisticsBL.getLogData(req.body.logType,
            req.body.range,
            req.body.datesRange,
            req.body.clientTimeZone,
            req.body.email).then(result => {
                res.send(result);
            }).catch(err => {
                errorHandler.routeError(err, res);
            });
    });

router.get('/getUserByEmail',
    (req, res, next) => {
        req.query.email = req.query.email.toLowerCase();
        next();
    },
    (req, res) => {
        statisticsBL.getUserByEmail(req.query.email).then(result => {
            // Return -1 in case the user is not found (result is null).
            res.send(result || "-1");
        }).catch(err => {
            errorHandler.routeError(err, res);
        });
    });

module.exports = router;