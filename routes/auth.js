module.exports = function (app) {
    // Checking if the session of the user is open.
    app.get('/isUserOnSession', function (req, res) {
        if (req.session.user) {
            res.send(true);
        }
        else {
            res.send(false);
        }
    });

    // Getting the current login user name.
    app.get('/getCurrUserName', function (req, res) {
        if (req.session.user) {
            var name = {
                "firstName": req.session.user.firstName,
                "lastName": req.session.user.lastName
            }

            res.send(name);
        }
        else {
            res.send(null);
        }
    });

    // Logout the user from session.
    app.get('/logout', function (req, res) {
        if (req.session) {
            delete req.session.user;
        }

        res.end();
    });
};