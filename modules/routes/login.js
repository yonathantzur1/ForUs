const router = require('express').Router();
const loginBL = require('../BL/loginBL');
const forgotPasswordBL = require('../BL/forgotPasswordBL');
const logsBL = require('../BL/logsBL');
const mailer = require('../mailer');
const tokenHandler = require('../handlers/tokenHandler');
const validate = require('../security/validate');
const bruteForceProtector = require('../security/bruteForceProtector');
const config = require('../../config');
const logger = require('../../logger');

// Validate the user details and login the user.
router.post('/userLogin',
    validate,
    (req, res, next) => {
        req.body.email = req.body.email.toLowerCase();
        next();
    },
    (req, res, next) => {
        bruteForceProtector.setFailReturnObj({ "result": { "lock": null } }, "result.lock");
        next();
    },
    bruteForceProtector.globalBruteforce.prevent,
    bruteForceProtector.userBruteforce.getMiddleware({
        key: (req, res, next) => {
            next(req.body.email + "/login");
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
                // In case user email and password are valid.
                else {
                    req.brute.reset(() => {
                        tokenHandler.SetTokenOnCookie(tokenHandler.GetTokenFromUserObject(result), res);
                        res.send({ "result": true });
                    });
                }
            }
            // In case of error.
            else {
                res.send({ result });

                // Log - in case the password is wrong.
                if (result == false) {
                    logsBL.LoginFail(req.body.email, req);
                }
            }
        }).catch((err) => {
            logger.error(err);
            res.sendStatus(500);
        });
    });

// Update user last login time in DB.
router.post('/updateLastLogin', (req, res) => {
    let token = tokenHandler.DecodeTokenFromRequest(req);

    if (token) {
        loginBL.UpdateLastLogin(token.user._id).then(() => {
            res.end();
        }).catch((err) => {
            logger.error(err);
            res.sendStatus(500);
        });
    }
    else {
        res.status(401).end();
    }
});

// Get user permissions from token.
router.get('/getUserPermissions', (req, res) => {
    let token = tokenHandler.DecodeTokenFromRequest(req);

    if (token) {
        res.send(token.user.permissions);
    }
    else {
        res.status(401).end();
    }
});

// Add new user to the DB and make sure the email is not already exists.
router.post('/register',
    validate,
    (req, res, next) => {
        req.body.email = req.body.email.toLowerCase();
        next();
    },
    (req, res) => {
        let email = { "email": req.body.email };

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
                        let token = tokenHandler.GetTokenFromUserObject(result);
                        tokenHandler.SetTokenOnCookie(token, res);
                        res.send({ "result": true });
                        logsBL.Register(email, req);
                    }
                    else {
                        res.send({ result });
                    }
                }).catch((err) => {
                    logger.error(err);
                    res.sendStatus(500);
                });
            }
        });
    });

// Sending to the user an email with code to reset his password.
router.put('/forgotPasswordRequest',
    validate,
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
    validate,
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

// Delete token from cookies.
router.delete('/deleteToken', (req, res) => {
    tokenHandler.DeleteTokenFromCookie(res);
    res.end();
});

module.exports = router;