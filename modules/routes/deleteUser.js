const router = require('express').Router();
const deleteUserBL = require('../BL/deleteUserBL');
const tokenHandler = require('../handlers/tokenHandler');
const validation = require('../security/validation');
const events = require('../events');
const logger = require('../../logger');

// Validating the delete user request unique token.
router.get('/validateDeleteUserToken',
    validation,
    (req, res) => {
        tokenHandler.DeleteAuthCookies(res);
        deleteUserBL.ValidateDeleteUserToken(req.query.token).then(result => {
            res.send(result ? { name: (result.firstName + " " + result.lastName) } : false);
        }).catch(err => {
            logger.error(err);
            res.sendStatus(500);
        });
    });

// Remove user account by token and password.
router.put('/deleteAccount',
    validation,
    (req, res) => {
        deleteUserBL.IsAllowToDeleteAccount(req.body).then(user => {
            // In case the password is wrong.
            if (user == false) {
                res.send(false);
                return;
            }

            // Change user id from ObjectId to string.
            user._id = user._id.toString();

            // Remove the user from DB.
            deleteUserBL.DeleteUserFromDB(user._id).then((userFriendsIds) => {
                events.emit('socket.RemoveFriendUser',
                    user._id,
                    user.firstName + " " + user.lastName,
                    userFriendsIds);

                res.send(true);
            }).catch((err) => {
                logger.error(err);
                res.sendStatus(500);
            });
        }).catch((err) => {
            logger.error(err);
            res.sendStatus(500);
        });;
    });

module.exports = router;