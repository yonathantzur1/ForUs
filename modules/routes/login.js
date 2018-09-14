const loginBL = require('../BL/loginBL');
const logsBL = require('../BL/logsBL');
const mailer = require('../mailer');
const general = require('../general');
const validate = require('../security/validate');
const bruteForceProtector = require('../security/bruteForceProtector');

bruteForceProtector.setFailReturnObj({ "result": { "lock": null } }, "result.lock");

module.exports = (app) => {

    prefix = "/login";

    // Validate the user details and login the user.
    app.post(prefix + '/userLogin',
        validate,
        bruteForceProtector.globalBruteforce.prevent,
        bruteForceProtector.userBruteforce.getMiddleware({
            key: (req, res, next) => {
                next(req.body.email);
            }
        }),
        (req, res) => {
            // Input: { email, password }
            // Output: result ->
            // (result == null): error or exception on the function.
            // (result == false): wrong password.
            // (result == "-1"): email is not exists on DB.
            // (result.block != null): The user is blocked.
            // else: email and password are valid.
            loginBL.GetUser(req.body).then((result) => {
                if (result) {
                    // In case the email is not exists on DB.
                    if (result == "-1") {
                        req.brute.reset(() => {
                            res.send({ result });
                        });
                    }
                    // In case the user is blocked.
                    else if (result.block) {
                        req.brute.reset(() => {
                            res.send({ result: { "block": result.block } });
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
                // In case of error.
                else {
                    res.send({ result });

                    // Log - in case the password is wrong.
                    if (result == false) {
                        logsBL.LoginFail(req.body.email,
                            general.GetIpFromRequest(req),
                            general.GetUserAgentFromRequest(req));
                    }
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
                            logsBL.Register(email, general.GetIpFromRequest(req), general.GetUserAgentFromRequest(req));
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

    // Delete token from cookies.
    app.delete(prefix + '/deleteToken', (req, res) => {
        general.DeleteTokenFromCookie(res);
        res.end();
    });
};