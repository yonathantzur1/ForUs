const router = require('express').Router();
const forgotPasswordBL = require('../../BL/forgotPasswordBL');
const tokenHandler = require('../../handlers/tokenHandler');
const validation = require('../../security/validation');
const logger = require('../../../logger');
const logsBL = require('../../BL/logsBL');
const mailer = require('../../mailer');
const config = require('../../../config');

// Sending to the user an email with code to reset his password.
router.put('/forgotPasswordRequest',
    validation,
    (req, res, next) => {
        req.body.email = req.body.email.toLowerCase();
        next();
    },
    (req, res) => {
        let email = req.body.email;

        forgotPasswordBL.SetUserResetCode(email).then(result => {
            if (result) {
                let resetAddress =
                    config.address.site + "/forgot/" + result.resetCode.token;
                mailer.ForgotPasswordMail(email,
                    result.firstName,
                    result.resetCode.code,
                    resetAddress);
                res.send({ "result": true });

                // Log - in case the user has found.
                logsBL.ResetPasswordRequest(email, req);
            }
            else {
                // Return to the client false in case the email was not found,
                // or null in case of error.
                res.send({ result });
            }
        }).catch(err => {
            logger.error(err);
            res.sendStatus(500);
        });
    });

// Changing user password in DB by code.
router.put('/resetPassword',
    validation,
    (req, res, next) => {
        req.body.email = req.body.email.toLowerCase();
        next();
    },
    (req, res) => {
        forgotPasswordBL.ResetPassword(req.body).then(result => {
            if (result && result.isChanged) {
                let token = tokenHandler.GetTokenFromUserObject(result.user);
                tokenHandler.SetTokenOnCookie(token, res);
                res.send({ "result": true });
            }
            else {
                res.send({ result });
            }
        }).catch(err => {
            logger.error(err);
            res.sendStatus(500);
        });
    });

// Validating the reset password request unique token.
router.get('/validateResetPasswordToken',
    validation,
    (req, res) => {
        tokenHandler.DeleteAuthCookies(res);
        forgotPasswordBL.ValidateResetPasswordToken(req.query.token).then(result => {
            res.send(result ? { name: (result.firstName + " " + result.lastName) } : false);
        }).catch(err => {
            logger.error(err);
            res.sendStatus(500);
        });
    });

// Changing user password in DB by token.
router.put('/resetPasswordByToken',
    validation,
    (req, res) => {
        forgotPasswordBL.ResetPasswordByToken(req.body).then(result => {
            if (result) {
                let token = tokenHandler.GetTokenFromUserObject(result);
                tokenHandler.SetTokenOnCookie(token, res, true);
                res.send(true);
            }
            else {
                res.send(result);
            }
        }).catch(err => {
            logger.error(err);
            res.sendStatus(500);
        });
    });

module.exports = router;