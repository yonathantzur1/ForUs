const router = require('express').Router();
const userPasswordWindowBL = require('../../BL/userPage/userPasswordWindowBL');
const forgotPasswordBL = require('../../BL/forgotPasswordBL');
const logsBL = require('../../BL/logsBL');
const validate = require('../../security/validate');
const bruteForceProtector = require('../../security/bruteForceProtector');
const config = require('../../../config');
const mailer = require('../../mailer');
const logger = require('../../../logger');

router.put('/updateUserPassword',
    validate,
    (req, res, next) => {
        bruteForceProtector.setFailReturnObj({ "result": { "lock": null } }, "result.lock");
        next();
    },
    bruteForceProtector.globalBruteforce.prevent,
    bruteForceProtector.userBruteforce.getMiddleware({
        key: (req, res, next) => {
            next(req.user.email + "/userPasswordWindow");
        }
    }),
    (req, res) => {
        userPasswordWindowBL.
            UpdateUserPassword(req.body.oldPassword, req.body.newPassword, req.user._id)
            .then(result => {
                if (result == true) {
                    req.brute.reset(() => {
                        res.send({ result });
                    });
                }
                else {
                    res.send({ result });
                }

                // Log - in case of reset password request.
                logsBL.ResetPasswordRequest(req.user.email, req);
            })
            .catch(err => {
                logger.error(err);
                res.sendStatus(500);
            });
    });

// Change password.
router.get('/changePasswordByMail', function (req, res) {
    let email = req.user.email;

    forgotPasswordBL.SetUserResetCode(email).then(result => {
        if (result) {
            let resetAddress =
                config.address.site + "/forgot/" + result.resetCode.token;
            mailer.ChangePasswordMail(email,
                result.firstName,
                resetAddress);
            res.send(true);

            // Log - in case of reset password request.
            logsBL.ResetPasswordRequest(email, req);
        }
        else {
            // Return to the client null in case of error.
            res.send(null);
        }
    }).catch(err => {
        logger.error(err);
        res.sendStatus(500);
    });
});

module.exports = router;