const loginBL = require('../BL/login/loginBL');
const tokenHandler = require('../handlers/tokenHandler');
const permissionHandler = require('../handlers/permissionHandler');

var prefix = "/api/auth";

module.exports = (app, connectedUsers) => {    
    // Checking if the session of the user is open.
    app.get(prefix + '/isUserOnSession', (req, res) => {
        if (!req.user) {
            res.send(false);
        }
        else {
            loginBL.GetUserById(req.user._id).then((user) => {
                var cookieUid = tokenHandler.GetUidFromRequest(req);

                // Double check uid (after main server token validae middleware)
                // from the original DB user object.
                if (user && user.uid == cookieUid && !(loginBL.IsUserBlocked(user))) {
                    tokenHandler.SetTokenOnCookie(tokenHandler.GetTokenFromUserObject(user), res, true);
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
    app.get(prefix + '/isUserRoot', (req, res) => {
        res.send(req.user && permissionHandler.IsUserHasRootPermission(req.user.permissions));
    });

    // Getting the current login user.
    app.get(prefix + '/getCurrUser', (req, res) => {
        var user = req.user;

        // Return user with only specific details.
        var userClientObject = {
            "_id": user._id,
            "uid": user.uid,
            "firstName": user.firstName,
            "lastName": user.lastName,
            "friends": user.friends
        }

        res.send(userClientObject);
    });

    // Set the current login user token.
    app.get(prefix + '/setCurrUserToken', (req, res) => {
        loginBL.GetUserById(req.user._id).then((user) => {
            if (user) {
                var token = tokenHandler.GetTokenFromUserObject(user);
                tokenHandler.SetTokenOnCookie(token, res);
                res.send(true);
            }
            else {
                res.send(false);
            }
        }).catch((err) => {
            res.status(500).end();
        });
    });

    app.get(prefix + '/isUserSocketConnect', (req, res) => {
        res.send(connectedUsers[req.user._id] ? true : false);
    });
};