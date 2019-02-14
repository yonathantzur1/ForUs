const loginBL = require('../BL/loginBL');
const tokenHandler = require('../handlers/tokenHandler');
const permissionHandler = require('../handlers/permissionHandler');
const logger = require('../../logger');

let prefix = "/api/auth";

module.exports = (app, connectedUsers) => {    
    // Checking if the session of the user is open.
    app.get(prefix + '/isUserOnSession', (req, res) => {
        if (!req.user) {
            res.send(false);
        }
        else {
            loginBL.GetUserById(req.user._id).then((user) => {
                let cookieUid = tokenHandler.GetUidFromRequest(req);

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
                logger.error(err);
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
        let user = req.user;

        // Return user with only specific details.
        let userClientObject = {
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
                let token = tokenHandler.GetTokenFromUserObject(user);
                tokenHandler.SetTokenOnCookie(token, res);
                res.send(true);
            }
            else {
                res.send(false);
            }
        }).catch((err) => {
            logger.error(err);
            res.status(500).end();
        });
    });

    app.get(prefix + '/isUserSocketConnect', (req, res) => {
        let socketUser = connectedUsers[req.user._id];

        if (socketUser) {
            socketUser.lastKeepAlive = new Date();
            res.send(true);
        }
        else {
            res.send(false);
        }        
    });
};