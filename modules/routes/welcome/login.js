const router = require('express').Router();
const loginBL = require('../../BL/welcome/loginBL');
const forgotPasswordBL = require('../../BL/forgotPasswordBL');
const logsBL = require('../../BL/logsBL');
const mailer = require('../../mailer');
const tokenHandler = require('../../handlers/tokenHandler');
const validation = require('../../security/validation');
const limitter = require('../../security/limitter');
const config = require('../../../config');
const logger = require('../../../logger');

// Validate the user details and login the user.
router.post('/userLogin',
    validation,
    (req, res, next) => {
        req.body.email = req.body.email.toLowerCase();
        next();
    },
    // Define limitter key.
    (req, res, next) => {
        req.limitterKey = req.body.email + req.url;
        next();
    },
    limitter,
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
                    res.send({ result });
                }
                // In case the user is blocked.
                else if (result.block) {
                    res.send({ "result": { "block": result.block } });
                }
                // In case user email and password are valid.
                else {
                    tokenHandler.SetTokenOnCookie(tokenHandler.GetTokenFromUserObject(result), res);
                    res.send({ "result": true });

                    // Log - in case the login is valid.
                    logsBL.Login(req.body.email, req);
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
        res.sendStatus(401);
    }
});

// Get user permissions from token.
router.get('/getUserPermissions', (req, res) => {
    let token = tokenHandler.DecodeTokenFromRequest(req);

    if (token) {
        res.send(token.user.permissions);
    }
    else {
        res.sendStatus(401);
    }
});

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

// Delete token from cookies.
router.delete('/deleteToken', (req, res) => {
    tokenHandler.DeleteTokenFromCookie(res);
    res.end();
});

module.exports = router;