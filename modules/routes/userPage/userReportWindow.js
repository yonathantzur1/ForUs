const router = require('express').Router();
const userReportWindowBL = require('../../BL/userPage/userReportWindowBL');
const validate = require('../../security/validate');
const logger = require('../../../logger');

// Get all report reasons from DB.
router.get('/getAllReportReasons', (req, res) => {
    userReportWindowBL.GetAllReportReasons().then(result => {
        res.send(result);
    }).catch(err => {
        logger.error(err);
        res.sendStatus(500);
    });
});

router.post('/reportUser',
    validate,
    (req, res) => {
        userReportWindowBL.ReportUser(req.user._id, req.user.friends, req.body).then(result => {
            res.send(result);
        }).catch(err => {
            logger.error(err);
            res.sendStatus(500);
        });
    });

module.exports = router;