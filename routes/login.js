var collectionName = "Users";

module.exports = function (app, loginBL, mailer, sha512) {

    // Validate the user details and login the user.
    app.post('/login', function (req, res) {
        loginBL.GetUser(collectionName, req.body, sha512, function (result) {
            // In case the user email and password are valid.
            if (result) {
                req.session.currUser = result;
                res.send(true);
            }
            else {
                res.send(result);
            }
        });
    });

    // Add new user to the db and make sure the email is not already exists.
    app.post('/register', function (req, res) {
        var email = { "email": req.body.email };

        // Check if the email is exists in the DB.
        loginBL.CheckIfUserExists(collectionName, email, function (result) {
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
                loginBL.AddUser(collectionName, req.body, sha512, function (result) {
                    // In case all register progress was succeeded.
                    if (result != null) {
                        // Sending welcome mail to the new user.
                        mailer.SendMail(req.body.email, mailer.GetRegisterMailContent(req.body.firstName));
                        req.session.currUser = req.body;
                    }

                    res.send(result);
                });
            }
        });
    });

    // Sending to the user an email with code to reset his password.
    app.put('/forgot', function (req, res) {
        var email = { "email": req.body.email };

        loginBL.AddResetCode(collectionName, email, function (result) {
            if (result != null && result != false) {
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
    app.put('/resetPassword', function (req, res) {
        loginBL.ResetPassword(collectionName, req.body, sha512, function (result) {
            res.send(result);
        });
    });

};