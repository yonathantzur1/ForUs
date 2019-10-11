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
        tokenHandler.deleteAuthCookies(res);
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
            if (!user) {
                return res.send(false);
            }

            // Remove the user from DB.
            deleteUserBL.DeleteUserFromDB(user._id.toString(),
                user.firstName,
                user.lastName,
                user.email,
                req).then((result) => {
                    res.send(result);
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