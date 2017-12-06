module.exports = function (app, loginBL, general) {
    prefix = "/api/auth";

    // Checking if the session of the user is open.
    app.get(prefix + '/isUserOnSession', function (req, res) {
        if (req.user) {
            var token = general.GetTokenFromUserObject(req.user);
            res.send({ "token": token });
        }
        else {
            res.send(false);
        }
    });

    // Getting the current login user.
    app.get(prefix + '/getCurrUser', function (req, res) {
        res.send(req.user);
    });

    // Getting the current login user token.
    app.get(prefix + '/getCurrUserToken', function (req, res) {
        if (req.user) {
            loginBL.GetUserById(req.user._id, function (user) {
                if (user) {
                    var token = general.GetTokenFromUserObject(user);
                    res.send({ "token": token });
                }
                else {
                    res.send(null);
                }
            });
        }
        else {
            res.send(null);
        }
    });
};