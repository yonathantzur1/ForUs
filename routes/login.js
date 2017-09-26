var general = require('../modules/general.js');

module.exports = function (app, loginBL, mailer, sha512) {

    prefix = "/login";

    // Validate the user details and login the user.
    app.post(prefix + '/login', function (req, res) {
        loginBL.GetUser(req.body, sha512, function (result) {
            // In case the user email and password are valid.
            if (result && result != "-1") {
                var token = general.GetTokenFromUserObject(result);
                res.send({ "token": token });
            }
            else {
                res.send(result);
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
                res.send(null);
            }
            // In case the user is already exists.
            else if (result == true) {
                res.send(false);
            }
            else {
                // Add user to DB.
                loginBL.AddUser(req.body, sha512, function (result) {
                    // In case all register progress was succeeded.
                    if (result) {
                        // Sending welcome mail to the new user.
                        mailer.SendMail(req.body.email, mailer.GetRegisterMailContent(req.body.firstName));
                        var token = general.GetTokenFromUserObject(result);
                        res.send({ "token": token });
                    }
                    else {
                        res.send(result);
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
                res.send(true);
            }
            else {
                // Return to the client false in case the email was not fount,
                // or null in case of error.
                res.send(result);
            }
        });
    });

    // Changing user password in db.
    app.put(prefix + '/resetPassword', function (req, res) {
        loginBL.ResetPassword(req.body, sha512, function (result) {
            res.send(result);
        });
    });

};