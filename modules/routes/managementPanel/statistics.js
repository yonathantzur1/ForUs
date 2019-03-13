const router = require('express').Router();
const statisticsBL = require('../../BL/managementPanel/statisticsBL');
const logger = require('../../../logger');

router.post('/getChartData',
    (req, res, next) => {
        if (req.body.email) {
            req.body.email = req.body.email.toLowerCase();
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
                logger.error(err);
                res.sendStatus(500);
            });
    });

router.get('/getUserByEmail',
    (req, res, next) => {
        req.query.email = req.query.email.toLowerCase();
        next();
    },
    (req, res) => {
        statisticsBL.GetUserByEmail(req.query.email).then(result => {
            // Return -1 in case the user is not found (result is null).
            res.send(result || "-1");
        }).catch(err => {
            logger.error(err);
            res.sendStatus(500);
        });
    });

module.exports = router;