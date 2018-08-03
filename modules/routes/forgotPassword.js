const forgotPasswordBL = require('../BL/forgotPasswordBL');
const logsBL = require('../BL/logsBL');
const mailer = require('../mailer');
const general = require('../general');
const validate = require('../validate');
const config = require('../../config');

module.exports = (app) => {
    prefix = "/forgotPassword";

    // Sending to the user an email with code to reset his password.
    app.put(prefix + '/forgot',
        validate,
        (req, res) => {
            var email = req.body.email;

            forgotPasswordBL.SetUserResetCode(email).then(result => {
                if (result) {
                    var resetAddress =
                        config.addresses.site + "/forgot/" + result.resetCode.token;
                    mailer.ForgotPasswordMail(email,
                        result.firstName,
                        result.resetCode.code,
                        resetAddress);
                    res.send({ "result": true });

                    // Log - in case the user has found.
                    logsBL.ResetPasswordRequest(email, general.GetIpFromRequest(req), general.GetUserAgentFromRequest(req));
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
        (req, res) => {
            forgotPasswordBL.ResetPassword(req.body).then(result => {
                if (result && result.isChanged) {
                    var token = general.GetTokenFromUserObject(result.user);
                    general.SetTokenOnCookie(token, res);
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
                    var token = general.GetTokenFromUserObject(result);
                    general.SetTokenOnCookie(token, res, true);
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