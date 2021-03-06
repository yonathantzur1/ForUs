const router = require('express').Router();
const usersReportsBL = require('../../BL/managementPanel/usersReportsBL');

router.get('/getAllReports', (req, res) => {
    usersReportsBL.getAllReports().then(result => {
        res.send(result);
    }).catch(err => {
        errorHandler.routeError(err, res);
    });
});

module.exports = router;