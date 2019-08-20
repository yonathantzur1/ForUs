const router = require('express').Router();
const loginBL = require('../BL/welcome/loginBL');
const tokenHandler = require('../handlers/tokenHandler');
const permissionHandler = require('../handlers/permissionHandler');
const logger = require('../../logger');
const logsBL = require('../BL/logsBL');
const enums = require('../enums');

// Checking if the session of the user is open.
router.get('/isUserOnSession', (req, res) => {
    if (!tokenHandler.ValidateUserAuthCookies(req)) {
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
            res.sendStatus(500);
        });
    }
});

// Checking if user has ADMIN permission.
router.get('/isUserRoot', (req, res) => {
    res.send(req.user && permissionHandler.IsUserHasRootPermission(req.user.permissions));
});

// Getting the current login user.
router.get('/getCurrUser', (req, res) => {
    let user = req.user;

    // Return user with only specific details.
    let userClientObject = {
        "_id": user._id,
        "uid": user.uid,
        "firstName": user.firstName,
        "lastName": user.lastName,
        "friends": user.friends
    }

    logsBL.Login(user.email, req);
    loginBL.UpdateLastLogin(user._id);
    res.send(userClientObject);
});

// Set the current login user token.
router.get('/setCurrUserToken', (req, res) => {
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
        res.sendStatus(500);
    });
});

router.get('/isUserSocketConnect', (req, res) => {
    let state;

    // In case the user is logout.
    if (!tokenHandler.ValidateUserAuthCookies(req)) {
        state = enums.SOCKET_STATE.LOGOUT;
    }
    else {
        let socketUser = req.connectedUsers[req.user._id];

        if (socketUser) {
            socketUser.lastKeepAlive = new Date();
            state = enums.SOCKET_STATE.ACTIVE;
        }
        else {
            state = enums.SOCKET_STATE.CLOSE;
        }
    }

    res.send({ state });
});

module.exports = router;