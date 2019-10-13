const router = require('express').Router();
const userReportWindowBL = require('../../BL/userPage/userReportWindowBL');
const validation = require('../../security/validation');
const errorHandler = require('../../handlers/errorHandler');

// Get all report reasons from DB.
router.get('/getAllReportReasons', (req, res) => {
    userReportWindowBL.getAllReportReasons().then(result => {
        res.send(result);
    }).catch(err => {
        errorHandler.routeError(err, res);
    });
});

router.post('/reportUser',
    validation,
    (req, res) => {
        userReportWindowBL.reportUser(req.user._id, req.user.friends, req.body).then(result => {
            res.send(result);
        }).catch(err => {
            errorHandler.routeError(err, res);
        });
    });

module.exports = router;