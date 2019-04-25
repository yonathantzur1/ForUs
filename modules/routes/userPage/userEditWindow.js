const router = require('express').Router();
const userEditWindowBL = require('../../BL/userPage/userEditWindowBL');
const validation = require('../../security/validation');
const limitter = require('../../security/limitter');
const logger = require('../../../logger');

router.put('/updateUserInfo',
    validation,
    (req, res, next) => {
        // In case one of the updated fields is email.
        if (req.body.updateFields.email) {
            req.body.updateFields.email = req.body.updateFields.email.toLowerCase();
        }

        next();
    },
    // Define limitter key.
    (req, res, next) => {
        req.limitterKey = req.user.email + req.url;
        next();
    },
    limitter,
    (req, res) => {
        let updateFields = req.body.updateFields;
        updateFields._id = req.user._id;

        userEditWindowBL.UpdateUserInfo(updateFields).then(result => {
            res.send({ result });
        }).catch(err => {
            logger.error(err);
            res.sendStatus(500);
        });
    });

module.exports = router;