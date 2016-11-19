module.exports = function (app, BL, mailer, sha512) {

    app.post('/login', function (req, res) {
        BL.ValidateUser("Users", req.body, sha512, function (result) {
            res.send(result);
        });
    });

    app.post('/register', function (req, res) {
        var email = { "email": req.body.email };

        // Check if the email is exists in the DB.
        BL.CheckIfUserExists("Users", email, function (result) {
            // In case of error.
            if (result == null) {
                res.send(null);
            }
            // In case the user is already exists.
            else if (result == true) {
                res.send(false);
            }
            else {
                // Add user to DB and return true.
                BL.AddUser("Users", req.body, sha512, function (result) {
                    // In case all register progress was succeeded.
                    if (result != null) {
                        // Sending welcome mail to the new user.
                        mailer.SendMail(req.body.email, mailer.GetRegisterMailContent(req.body.name));
                    }

                    res.send(result);
                });
            }
        });
    });

    app.put('/forgot', function (req, res) {
        var email = { "email": req.body.email };

        BL.AddResetCode("Users", email, function (result) {
            if (result != null && result != false) {
                mailer.SendMail(req.body.email, mailer.GetForgotMailContent(result.name, result.resetCode.code));

                // Send true to client.
                res.send(true);
            }
            else {
                res.send(result);
            }
        });
    });

    app.put('/resetPassword', function (req, res) {
        BL.ResetPassword("Users", req.body, sha512, function (result) {
            res.send(result);
        });
    });

};