const router = require('express').Router();
const userPasswordWindowBL = require('../../BL/userPage/userPasswordWindowBL');
const forgotPasswordBL = require('../../BL/forgotPasswordBL');
const logsBL = require('../../BL/logsBL');
const validator = require('../../security/validations/validator');
const limitter = require('../../security/limitter');
const config = require('../../../config');
const mailer = require('../../mailer');
const errorHandler = require('../../handlers/errorHandler');

router.put('/updateUserPassword',
    validator,
    // Define limitter key.
    (req, res, next) => {
        req.limitterKey = req.user.email;
        next();
    },
    limitter,
    (req, res) => {
        userPasswordWindowBL.
            updateUserPassword(req.body.oldPassword, req.body.newPassword, req.user._id)
            .then(result => {
                res.send({ result });

                // Log - in case of reset password request.
                logsBL.resetPasswordRequest(req.user.email, req);
            }).catch(err => {
                errorHandler.routeError(err, res);
            });
    });

// Change password.
router.get('/changePasswordByMail', (req, res) => {
    let email = req.user.email;

    forgotPasswordBL.setUserResetCode(email).then(result => {
        if (result) {
            let resetAddress =
                config.address.site + "/forgot/" + result.resetCode.token;
            mailer.changePasswordMail(email,
                result.firstName,
                resetAddress);
            res.send(true);

            // Log - in case of reset password request.
            logsBL.resetPasswordRequest(email, req);
        }
        else {
            // Return to the client null in case of error.
            res.send(null);
        }
    }).catch(err => {
        errorHandler.routeError(err, res);
    });
});

module.exports = router;