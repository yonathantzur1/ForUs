const router = require('express').Router();
const deleteUserBL = require('../BL/deleteUserBL');
const tokenHandler = require('../handlers/tokenHandler');
const validation = require('../security/validation');
const events = require('../events');
const errorHandler = require('../handlers/errorHandler');

// Validating the delete user request unique token.
router.get('/validateDeleteUserToken',
    validation,
    (req, res) => {
        tokenHandler.deleteAuthCookies(res);
        deleteUserBL.validateDeleteUserToken(req.query.token).then(result => {
            res.send(result ? { name: (result.firstName + " " + result.lastName) } : false);
        }).catch(err => {
            errorHandler.routeError(err, res);
        });
    });

// Remove user account by token and password.
router.put('/deleteAccount',
    validation,
    (req, res) => {
        deleteUserBL.isAllowToDeleteAccount(req.body).then(user => {
            // In case the password is wrong.
            if (!user) {
                return res.send(false);
            }

            // Remove the user from DB.
            deleteUserBL.deleteUserFromDB(user._id.toString(),
                user.firstName,
                user.lastName,
                user.email,
                req).then(result => {
                    res.send(result);
                    events.emit('socket.LogoutUserSession',
                        user._id.toString(),
                        "מחיקת המשתמש שלך בוצעה בהצלחה.");
                }).catch(err => {
                    errorHandler.routeError(err, res);
                });
        }).catch(err => {
            errorHandler.routeError(err, res);
        });;
    });

module.exports = router;