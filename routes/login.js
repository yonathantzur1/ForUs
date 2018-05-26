const loginBL = require('../modules/BL/loginBL');
const logsBL = require('../modules/BL/logsBL');
const mailer = require('../modules/mailer');
const general = require('../modules/general');
const config = require('../modules/config');
const validate = require('../modules/validate');
const ExpressBrute = require('express-brute'),
    store = new ExpressBrute.MemoryStore();

var failCallback = (req, res, next, nextValidRequestDate) => {
    var minutesLockTime =
        Math.ceil((nextValidRequestDate.getTime() - (new Date()).getTime()) / (1000 * 60));
    res.send({ "result": { "lock": minutesLockTime } });
};

var handleStoreError = (error) => {
    log.error(error);

    throw {
        message: error.message,
        parent: error.parent
    };
}
// Start slowing requests after 5 failed attempts.
var userBruteforce = new ExpressBrute(store, {
    freeRetries: config.security.expressBrute.freeRetries,
    minWait: config.security.expressBrute.minWait,
    maxWait: config.security.expressBrute.maxWait,
    failCallback: failCallback,
    handleStoreError: handleStoreError
});

// No more than 1000 login attempts per day per IP.
var globalBruteforce = new ExpressBrute(store, {
    freeRetries: 1000,
    attachResetToRequest: false,
    refreshTimeoutOnRequest: false,
    minWait: 25 * 60 * 60 * 1000, // 1 day 1 hour (should never reach this wait time) 
    maxWait: 25 * 60 * 60 * 1000, // 1 day 1 hour (should never reach this wait time) 
    lifetime: 24 * 60 * 60, // 1 day (seconds not milliseconds) 
    failCallback: failCallback,
    handleStoreError: handleStoreError
});

module.exports = (app) => {

    prefix = "/login";

    // Validate the user details and login the user.
    app.post(prefix + '/userLogin',
        validate,
        globalBruteforce.prevent,
        userBruteforce.getMiddleware({
            key: (req, res, next) => {
                next(req.body.email);
            }
        }),
        (req, res) => {
            loginBL.GetUser(req.body).then((result) => {
                if (result) {
                    // In case the user is not exists.
                    if (result == "-1") {
                        req.brute.reset(() => {
                            res.send({ result });
                        });
                    }
                    // In case the user is blocked.
                    else if (result.block) {
                        req.brute.reset(() => {
                            res.send({ result: { "block": result.block } });

                            // Log - in case the email and password are valid but the user is blocked.
                            logsBL.Login(req.body.email, general.GetIpFromRequest(req), general.GetUserAgentFromRequest(req));
                        });
                    }                    
                    // In case the user email and password are valid.
                    else {
                        req.brute.reset(() => {
                            general.SetTokenOnCookie(general.GetTokenFromUserObject(result), res);
                            res.send({ "result": true });
                        });
                    }
                }
                // In case of error
                else {
                    res.send({ result });

                    // Log - in case the password is wrong.
                    (result == false) && logsBL.LoginFail(req.body.email, general.GetIpFromRequest(req), general.GetUserAgentFromRequest(req));
                }
            }).catch((err) => {
                res.status(500).end();
            });
        });

    // Update user last login time in DB.
    app.post(prefix + '/updateLastLogin', (req, res) => {
        var token = general.DecodeToken(general.GetTokenFromRequest(req));

        if (token) {
            loginBL.UpdateLastLogin(token.user._id).then(() => {
                res.end();
            }).catch((err) => {
                res.status(500).end();
            });
        }
        else {
            res.status(401).end();
        }
    });

    // Get user permissions from token.
    app.get(prefix + '/getUserPermissions', (req, res) => {
        var token = general.DecodeToken(general.GetTokenFromRequest(req));

        if (token) {
            res.send(token.user.permissions);
        }
        else {
            res.status(401).end();
        }
    });

    // Add new user to the db and make sure the email is not already exists.
    app.post(prefix + '/register',
        validate,
        (req, res) => {
            var email = { "email": req.body.email };

            // Check if the email is exists in the DB.
            loginBL.CheckIfUserExists(email).then((result) => {
                // In case the user is already exists.
                if (result) {
                    res.send({ "result": false });
                }
                else {
                    // Add user to DB.
                    loginBL.AddUser(req.body).then((result) => {
                        // In case all register progress was succeeded.
                        if (result) {
                            // Sending a welcome mail to the new user.
                            mailer.RegisterMail(req.body.email, req.body.firstName);
                            var token = general.GetTokenFromUserObject(result);
                            general.SetTokenOnCookie(token, res);
                            res.send({ "result": true });
                        }
                        else {
                            res.send({ result });
                        }
                    }).catch((err) => {
                        res.status(500).end();
                    });
                }
            });
        });

    // Sending to the user an email with code to reset his password.
    app.put(prefix + '/forgot',
        validate,
        (req, res) => {
            var email = req.body.email;

            loginBL.SetUserResetCode(email).then((result) => {
                if (result) {
                    mailer.ForgotPasswordMail(email, result.firstName, result.resetCode.code);
                    res.send({ "result": true });

                    // Log - in case the user has found.
                    logsBL.ResetPasswordRequest(email, general.GetIpFromRequest(req), general.GetUserAgentFromRequest(req));
                }
                else {
                    // Return to the client false in case the email was not found,
                    // or null in case of error.
                    res.send({ result });
                }
            }).catch((err) => {
                res.status(500).end();
            });
        });

    // Changing user password in db.
    app.put(prefix + '/resetPassword',
        validate,
        (req, res) => {
            loginBL.ResetPassword(req.body).then((result) => {
                if (result && result.isChanged) {
                    var token = general.GetTokenFromUserObject(result.user);
                    general.SetTokenOnCookie(token, res);

                    res.send({ "result": true });
                }
                else {
                    res.send({ result });
                }
            }).catch((err) => {
                res.status(500).end();
            });
        });

    // Delete token from cookies.
    app.delete(prefix + '/deleteToken', (req, res) => {
        general.DeleteTokenFromCookie(res);
        res.end();
    });
};