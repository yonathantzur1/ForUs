const router = require('express').Router();
const forgotPasswordBL = require('../../BL/forgotPasswordBL');
const tokenHandler = require('../../handlers/tokenHandler');
const validator = require('../../security/validations/validator');
const errorHandler = require('../../handlers/errorHandler');
const logsBL = require('../../BL/logsBL');
const mailer = require('../../mailer');
const config = require('../../../config');

// Sending to the user an email with code to reset his password.
router.put('/forgotPasswordRequest',
    validator,
    (req, res, next) => {
        req.body.email = req.body.email.toLowerCase();
        next();
    },
    (req, res) => {
        let email = req.body.email;

        forgotPasswordBL.setUserResetCode(email).then(result => {
            if (result) {
                let resetAddress =
                    config.address.site + "/forgot/" + result.resetCode.token;
                mailer.forgotPasswordMail(email,
                    result.firstName,
                    result.resetCode.code,
                    resetAddress);
                res.send({ "result": true });

                // Log - in case the user has found.
                logsBL.resetPasswordRequest(email, req);
            }
            else {
                // Return to the client false in case the email was not found,
                // or null in case of error.
                res.send({ result });
            }
        }).catch(err => {
            errorHandler.routeError(err, res);
        });
    });

// Changing user password in DB by code.
router.put('/resetPassword',
    validator,
    (req, res, next) => {
        req.body.email = req.body.email.toLowerCase();
        next();
    },
    (req, res) => {
        forgotPasswordBL.resetPassword(req.body).then(result => {
            if (result && result.isChanged) {
                let token = tokenHandler.getTokenFromUserObject(result.user);
                tokenHandler.setTokenOnCookie(token, res);
                res.send({ "result": true });
            }
            else {
                res.send({ result });
            }
        }).catch(err => {
            errorHandler.routeError(err, res);
        });
    });

// Validating the reset password request unique token.
router.get('/validateResetPasswordToken',
    validator,
    (req, res) => {
        tokenHandler.deleteAuthCookies(res);
        forgotPasswordBL.validateResetPasswordToken(req.query.token).then(result => {
            res.send(result ? { name: (result.firstName + " " + result.lastName) } : false);
        }).catch(err => {
            errorHandler.routeError(err, res);
        });
    });

// Changing user password in DB by token.
router.put('/resetPasswordByToken',
    validator,
    (req, res) => {
        forgotPasswordBL.resetPasswordByToken(req.body).then(result => {
            if (result) {
                let token = tokenHandler.getTokenFromUserObject(result);
                tokenHandler.setTokenOnCookie(token, res, true);
                res.send(true);
            }
            else {
                res.send(result);
            }
        }).catch(err => {
            errorHandler.routeError(err, res);
        });
    });

module.exports = router;