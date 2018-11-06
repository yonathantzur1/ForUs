const userPasswordWindowBL = require('../../BL/userPage/userPasswordWindowBL');
const forgotPasswordBL = require('../../BL/login/forgotPasswordBL');
const validate = require('../../security/validate');
const bruteForceProtector = require('../../security/bruteForceProtector');
const config = require('../../../config');
const mailer = require('../../mailer');
const requestHandler = require('../../handlers/requestHandler');

var prefix = "/api/userPasswordWindow";

module.exports = function (app) {
    app.put(prefix + '/updateUserPassword',
        validate,
        (req, res, next) => {
            bruteForceProtector.setFailReturnObj({ "lock": null }, "lock");
            next();
        },
        bruteForceProtector.globalBruteforce.prevent,
        bruteForceProtector.userBruteforce.getMiddleware({
            key: (req, res, next) => {
                next(req.user.email + prefix);
            }
        }),
        (req, res) => {
            userPasswordWindowBL.
                UpdateUserPassword(req.body.oldPassword, req.body.newPassword, req.user._id)
                .then(result => {
                    if (result == true) {
                        req.brute.reset(() => {
                            res.send(result);
                        });
                    }
                    else {
                        res.send(result);
                    }
                })
                .catch(err => {
                    res.status(500).end();
                });
        });

    // Change password.
    app.get(prefix + '/changePasswordByMail', function (req, res) {
        var email = req.user.email;

        forgotPasswordBL.SetUserResetCode(email).then(result => {
            if (result) {
                var resetAddress =
                    config.addresses.site + "/forgot/" + result.resetCode.token;
                mailer.ChangePasswordMail(email,
                    result.firstName,
                    resetAddress);
                res.send(true);

                // Log - in case the user has found.
                logsBL.ResetPasswordRequest(email,
                    requestHandler.GetIpFromRequest(req),
                    requestHandler.GetUserAgentFromRequest(req));
            }
            else {
                // Return to the client null in case of error.
                res.send(null);
            }
        }).catch(err => {
            res.status(500).end();
        });
    });
}