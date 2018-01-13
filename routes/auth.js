const loginBL = require('../modules/BL/loginBL');
const general = require('../modules/general');

module.exports = function (app) {
    prefix = "/api/auth";

    // Checking if the session of the user is open.
    app.get(prefix + '/isUserOnSession', function (req, res) {
        loginBL.GetUserById(req.user._id, function (user) {
            if (user) {
                general.SetTokenOnCookie(general.GetTokenFromUserObject(user), res);
                res.send(true);
            }
            else {
                res.send(false);
            }
        });

    });

    // Checking if user has ADMIN permission.
    app.get(prefix + '/isUserAdmin', function (req, res) {
        res.send((req.user && (req.user.permissions.indexOf(general.PERMISSIONS.ADMIN) != -1)));
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
};