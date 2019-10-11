const router = require('express').Router();
const loginBL = require('../../BL/welcome/loginBL');
const logsBL = require('../../BL/logsBL');
const tokenHandler = require('../../handlers/tokenHandler');
const validation = require('../../security/validation');
const limitter = require('../../security/limitter');
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
                    tokenHandler.setTokenOnCookie(tokenHandler.getTokenFromUserObject(result), res);
                    res.send({ "result": true });
                }
            }
            // In case of error.
            else {
                res.send({ result });

                // In case the password is wrong.
                if (result == false) {
                    logsBL.LoginFail(req.body.email, req);
                }
            }
        }).catch((err) => {
            logger.error(err);
            res.sendStatus(500);
        });
    });

// Delete token from cookies.
router.delete('/deleteToken', (req, res) => {
    tokenHandler.deleteTokenFromCookie(res);
    res.send(true);
});

module.exports = router;