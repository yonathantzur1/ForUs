var config = require('../modules/config.js');
var ExpressBrute = require('express-brute'),
    store = new ExpressBrute.MemoryStore();

var failCallback = function (req, res, next, nextValidRequestDate) {
    var minutesLockTime =
        Math.ceil((nextValidRequestDate.getTime() - (new Date()).getTime()) / (1000 * 60));
    res.send({ "lock": minutesLockTime });
};

var handleStoreError = function (error) {
    log.error(error);

    throw {
        message: error.message,
        parent: error.parent
    };
}
// Start slowing requests after 5 failed attempts.
var userBruteforce = new ExpressBrute(store, {
    freeRetries: 10,
    minWait: config.expressBrute.minWait,
    maxWait: config.expressBrute.maxWait,
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


module.exports = function (app, loginBL, mailer, sha512, general) {

    prefix = "/login";

    // Validate the user details and login the user.
    app.post(prefix + '/login',
        globalBruteforce.prevent,
        userBruteforce.getMiddleware({
            key: function (req, res, next) {
                next(req.body.email);
            }
        }),
        function (req, res, next) {
            loginBL.GetUser(req.body, sha512, function (result) {
                // In case the user email and password are valid.
                if (result && result != "-1") {
                    req.brute.reset(function () {
                        var token = general.GetTokenFromUserObject(result);
                        general.SetTokenOnCookie(token, res);
                        res.send({ "result": true });
                    });
                }
                else {
                    // In case the user is not exists.
                    if (result == "-1") {
                        req.brute.reset(function () {
                            res.send({ result });
                        });
                    }
                    else {
                        res.send({ result });
                    }
                }
            });
        });

    // Add new user to the db and make sure the email is not already exists.
    app.post(prefix + '/register', function (req, res) {
        var email = { "email": req.body.email };

        // Check if the email is exists in the DB.
        loginBL.CheckIfUserExists(email, function (result) {
            // In case of error.
            if (result == null) {
                res.send({ result });
            }
            // In case the user is already exists.
            else if (result == true) {
                res.send({ "result": false });
            }
            else {
                // Add user to DB.
                loginBL.AddUser(req.body, sha512, function (result) {
                    // In case all register progress was succeeded.
                    if (result) {
                        // Sending welcome mail to the new user.
                        mailer.SendMail(req.body.email, mailer.GetRegisterMailContent(req.body.firstName));
                        var token = general.GetTokenFromUserObject(result);
                        general.SetTokenOnCookie(token, res);
                        res.send({ "result": true });
                    }
                    else {
                        res.send({ result });
                    }
                });
            }
        });
    });

    // Sending to the user an email with code to reset his password.
    app.put(prefix + '/forgot', function (req, res) {
        var email = { "email": req.body.email };

        loginBL.AddResetCode(email, function (result) {
            if (result) {
                mailer.SendMail(req.body.email, mailer.GetForgotMailContent(result.firstName, result.resetCode.code));
                res.send({ "result": true });
            }
            else {
                // Return to the client false in case the email was not found,
                // or null in case of error.
                res.send({ result });
            }
        });
    });

    // Changing user password in db.
    app.put(prefix + '/resetPassword', function (req, res) {
        loginBL.ResetPassword(req.body, sha512, function (result) {
            res.send({ result });
        });
    });

};