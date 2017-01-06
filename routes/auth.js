module.exports = function (app) {
    // Checking if the session of the user is open.
    app.get('/isUserOnSession', function (req, res) {
        if (req.session.currUser) {
            res.send(true);
        }
        else {
            res.send(false);
        }
    });

    // Getting the current login user name.
    app.get('/getCurrUserName', function (req, res) {
        if (req.session.currUser) {
            res.send(req.session.currUser.firstName);
        }
        else {
            res.send(null);
        }
    });

    // logout the user from session
    app.get('/logout', function (req, res) {
        if (req.session.currUser) {
            delete req.session.currUser;
        }

        res.end();
    });
};