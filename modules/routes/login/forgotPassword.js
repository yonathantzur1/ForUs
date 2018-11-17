const forgotPasswordBL = require('../../BL/login/forgotPasswordBL');
const logsBL = require('../../BL/logsBL');
const mailer = require('../../mailer');
const tokenHandler = require('../../handlers/tokenHandler');
const validate = require('../../security/validate');
const config = require('../../../config');
const general = require('../../general');

var prefix = "/forgotPassword";

module.exports = (app) => {
    // Sending to the user an email with code to reset his password.
    app.put(prefix + '/forgot',
        validate,
        (req, res, next) => {
            general.LowerStringInObject(req, "body.email");
            next();
        },
        (req, res) => {
            var email = req.body.email;

            forgotPasswordBL.SetUserResetCode(email).then(result => {
                if (result) {
                    var resetAddress =
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
                res.status(500).end();
            });
        });

    // Changing user password in DB by code.
    app.put(prefix + '/resetPassword',
        validate,
        (req, res, next) => {
            general.LowerStringInObject(req, "body.email");
            next();
        },
        (req, res) => {
            forgotPasswordBL.ResetPassword(req.body).then(result => {
                if (result && result.isChanged) {
                    var token = tokenHandler.GetTokenFromUserObject(result.user);
                    tokenHandler.SetTokenOnCookie(token, res);
                    res.send({ "result": true });
                }
                else {
                    res.send({ result });
                }
            }).catch(err => {
                res.status(500).end();
            });
        });

    app.get(prefix + '/validateResetPasswordToken',
        validate,
        (req, res) => {
            forgotPasswordBL.ValidateResetPasswordToken(req.query.token).then(result => {
                res.send(result ? { name: (result.firstName + " " + result.lastName) } : false);
            }).catch(err => {
                res.status(500).end();
            });
        });

    // Changing user password in DB by token.
    app.put(prefix + '/resetPasswordByToken',
        validate,
        (req, res) => {
            forgotPasswordBL.ResetPasswordByToken(req.body).then(result => {
                if (result) {
                    var token = tokenHandler.GetTokenFromUserObject(result);
                    tokenHandler.SetTokenOnCookie(token, res, true);
                    res.send(true);
                }
                else {
                    res.send(result);
                }
            }).catch(err => {
                res.status(500).end();
            });
        });
};