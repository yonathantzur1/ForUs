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
        registerBL.addUser(req.body).then(result => {
            // In case the email is exists.
            if (!result) {
                res.send({ result });
            }
            else {
                let token = tokenHandler.getTokenFromUserObject(result);
                tokenHandler.setTokenOnCookie(token, res);
                res.send({ "result": true });

                let email = result.email;
                mailer.registerMail(email, result.firstName);
                logsBL.register(email, req);
            }
        }).catch(err => {
            errorHandler.routeError(err, res);
        });
    });

module.exports = router;