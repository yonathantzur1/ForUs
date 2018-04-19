const loginBL = require('../modules/BL/loginBL');
const general = require('../modules/general');

module.exports = (app) => {
    prefix = "/api/auth";

    // Checking if the session of the user is open.
    app.get(prefix + '/isUserOnSession', (req, res) => {
        if (!req.user) {
            res.send(false);
        }
        else {
            loginBL.GetUserById(req.user._id).then((user) => {
                var cookieUid = general.GetUidFromRequest(req);

                // Double check uid (after main server token validae middleware)
                // from the original DB user object.
                if (user && user.uid == cookieUid && !(loginBL.IsUserBlocked(user))) {
                    general.SetTokenOnCookie(general.GetTokenFromUserObject(user), res, true);
                    res.send(true);
                }
                else {
                    res.send(false);
                }
            }).catch((err) => {
                res.status(500).end();
            });
        }
    });

    // Checking if user has ADMIN permission.
    app.get(prefix + '/isUserAdmin', (req, res) => {
        res.send(req.user && general.IsUserHasRootPermission(req.user.permissions));
    });

    // Getting the current login user.
    app.get(prefix + '/getCurrUser', (req, res) => {
        res.send(req.user);
    });

    // Set the current login user token.
    app.get(prefix + '/setCurrUserToken', (req, res) => {
        if (req.user) {
            loginBL.GetUserById(req.user._id).then((user) => {
                if (user) {
                    var token = general.GetTokenFromUserObject(user);
                    general.SetTokenOnCookie(token, res);
                    res.send(true);
                }
                else {
                    res.send(false);
                }
            }).catch((err) => {
                res.status(500).end();
            });
        }
        else {
            res.send(null);
        }
    });
};