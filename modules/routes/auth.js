const router = require('express').Router();
const loginBL = require('../BL/welcome/loginBL');
const tokenHandler = require('../handlers/tokenHandler');
const permissionHandler = require('../handlers/permissionHandler');
const logger = require('../../logger');
const logsBL = require('../BL/logsBL');
const enums = require('../enums');

// Checking if the session of the user is open.
router.get('/isUserOnSession', (req, res) => {
    if (!tokenHandler.validateUserAuthCookies(req)) {
        res.send(false);
    }
    else {
        loginBL.GetUserById(req.user._id).then((user) => {
            let cookieUid = tokenHandler.getUidFromRequest(req);

            // Double check uid (after main server token validae middleware)
            // from the original DB user object.
            if (user && user.uid == cookieUid && !(loginBL.IsUserBlocked(user))) {
                tokenHandler.setTokenOnCookie(tokenHandler.getTokenFromUserObject(user), res, true);
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
    res.send(req.user && permissionHandler.isUserHasRootPermission(req.user.permissions));
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
            let token = tokenHandler.getTokenFromUserObject(user);
            tokenHandler.setTokenOnCookie(token, res);
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
    if (!tokenHandler.validateUserAuthCookies(req)) {
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

// Get user permissions from token.
router.get('/getUserPermissions', (req, res) => {
    res.send(req.user.permissions);
});

module.exports = router;