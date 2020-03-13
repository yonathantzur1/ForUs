const router = require('express').Router();
const registerBL = require('../../BL/welcome/registerBL');
const logsBL = require('../../BL/logsBL');
const mailer = require('../../mailer');
const tokenHandler = require('../../handlers/tokenHandler');
const validator = require('../../security/validations/validator');
const errorHandler = require('../../handlers/errorHandler');

// Add new user to the DB and make sure the email is not already exists.
router.post('/register',
    validator,
    (req, res, next) => {
        req.body.email = req.body.email.toLowerCase();
        next();
    },
    (req, res) => {
        registerBL.addUser(req.body).then(user => {
            // In case the email is exists.
            if (!user) {
                res.send({ result: user });
            }
            else {
                let token = tokenHandler.getTokenFromUserObject(user);
                tokenHandler.setTokenOnCookie(token, res);
                res.send({ "result": true });

                let email = user.email;
                mailer.registerMail(email, user.firstName);
                logsBL.register(email, req);
            }
        }).catch(err => {
            errorHandler.routeError(err, res);
        });
    });

module.exports = router;