module.exports = function (app, loginBL, general) {
    prefix = "/api/auth";

    // Checking if the session of the user is open.
    app.get(prefix + '/isUserOnSession', function (req, res) {
        if (req.user && req.user._id.toString() == general.GetUserIdFromRequest(req)) {
            var token = general.GetTokenFromUserObject(req.user);
            general.SetTokenOnCookie(token, res);
            res.send(true);
        }
        else {
            general.DeleteAuthCookies(res);
            res.send(false);
        }
    });

    // Getting the current login user.
    app.get(prefix + '/getCurrUser', function (req, res) {
        res.send(req.user);
    });

    // Set the current login user token.
    app.get(prefix + '/setCurrUserToken', function (req, res) {
        if (req.user) {
            loginBL.GetUserById(req.user._id, function (user) {
                if (user) {
                    var token = general.GetTokenFromUserObject(user);
                    general.SetTokenOnCookie(token, res);
                    res.send(true);
                }
                else {
                    res.send(false);
                }
            });
        }
        else {
            res.send(null);
        }
    });

    // Delete token from cookies.
    app.delete(prefix + '/deleteToken', function (req, res) {
        general.DeleteTokenFromCookie(res);
        res.end();
    });
};