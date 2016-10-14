module.exports = function (app, BL, mailer) {

    app.get('/login/:email/:password', function (req, res) {
        var filter = { "email": req.params.email, 'password': req.params.password };
        BL.ValidateUser("Users", filter, function (result) {
            // In case of error.
            if (result == null) {
                res.status(500).send();
            }
            else {
                res.send(result)
            }
        });
    });

    app.post('/Register', function (req, res) {
        var email = { "email": req.body.email };

        // Check if the email is exists in the DB.
        BL.CheckIfUserExists("Users", email, function (result) {
            // In case of error.
            if (result == null) {
                res.status(500).send();
            }
            // In case the user is already exists.
            else if (result == true) {
                res.send(false);
            }
            else {
                var newUser = { "name": req.body.name, "email": req.body.email, "password": req.body.password };

                // Add user to DB and return true.
                BL.AddUser("Users", newUser, function (result) {
                    // In case of error.
                    if (result == null) {
                        res.status(500).send();
                    }
                    // In case all register progress was succeeded.
                    else {
                        // Sending welcome mail to the new user.
                        mailer.SendMail(req.body.email, mailer.GetRegisterMailContent(req.body.name));

                        // Send the new user that added to DB.
                        res.send(result);
                    }
                });
            }
        });
    });

};