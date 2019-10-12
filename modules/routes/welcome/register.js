const router = require('express').Router();
const registerBL = require('../../BL/welcome/registerBL');
const logsBL = require('../../BL/logsBL');
const mailer = require('../../mailer');
const tokenHandler = require('../../handlers/tokenHandler');
const validation = require('../../security/validation');
const logger = require('../../../logger');


// Add new user to the DB and make sure the email is not already exists.
router.post('/register',
    validation,
    (req, res, next) => {
        req.body.email = req.body.email.toLowerCase();
        next();
    },
    (req, res) => {
        let email = req.body.email;

        // Check if the email is exists in the DB.
        registerBL.checkIfUserExists(email).then((result) => {
            // In case the user is already exists.
            if (result) {
                res.send({ "result": false });
            }
            else {
                // Add user to DB.
                registerBL.addUser(req.body).then((user) => {
                    // In case all register progress was succeeded.
                    if (user) {
                        // Sending a welcome mail to the new user.
                        mailer.registerMail(email, req.body.firstName);
                        let token = tokenHandler.getTokenFromUserObject(user);
                        tokenHandler.setTokenOnCookie(token, res);
                        res.send({ "result": true });
                        logsBL.register(email, req);
                    }
                    else {
                        res.send({ result: user });
                    }
                }).catch((err) => {
                    logger.error(err);
                    res.sendStatus(500);
                });
            }
        });
    });

module.exports = router;