const router = require('express').Router();
const usersReportsBL = require('../../BL/managementPanel/usersReportsBL');
const logger = require('../../../logger');

router.get('/getAllReports', function (req, res) {
    usersReportsBL.GetAllReports().then((result) => {
        res.send(result);
    }).catch((err) => {
        logger.error(err);
        res.sendStatus(500);
    });
});

module.exports = router;