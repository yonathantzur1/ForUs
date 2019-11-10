const router = require('express').Router();
const userEditWindowBL = require('../../BL/userPage/userEditWindowBL');
const validator = require('../../security/validations/validator');
const limitter = require('../../security/limitter');
const errorHandler = require('../../handlers/errorHandler');

router.put('/updateUserInfo',
    validator,
    (req, res, next) => {
        // In case one of the updated fields is email.
        if (req.body.updateFields.email) {
            req.body.updateFields.email = req.body.updateFields.email.toLowerCase();
        }

        // Define limitter key.
        req.limitterKey = req.user.email;
        next();
    },
    limitter,
    (req, res) => {
        let updateFields = req.body.updateFields;
        updateFields._id = req.user._id;

        userEditWindowBL.updateUserInfo(updateFields).then(result => {
            res.send({ result });
        }).catch(err => {
            errorHandler.routeError(err, res);
        });
    });

module.exports = router;