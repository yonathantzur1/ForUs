const router = require('express').Router();
const forgotPasswordBL = require('../BL/forgotPasswordBL');
const tokenHandler = require('../handlers/tokenHandler');
const validate = require('../security/validate');
const logger = require('../../logger');

// Validating the reset password request unique token.
router.get('/validateResetPasswordToken',
    validate,
    (req, res) => {
        tokenHandler.DeleteAuthCookies(res);
        forgotPasswordBL.ValidateResetPasswordToken(req.query.token).then(result => {
            res.send(result ? { name: (result.firstName + " " + result.lastName) } : false);
        }).catch(err => {
            logger.error(err);
            res.sendStatus(500);
        });
    });

// Changing user password in DB by token.
router.put('/resetPasswordByToken',
    validate,
    (req, res) => {
        forgotPasswordBL.ResetPasswordByToken(req.body).then(result => {
            if (result) {
                let token = tokenHandler.GetTokenFromUserObject(result);
                tokenHandler.SetTokenOnCookie(token, res, true);
                res.send(true);
            }
            else {
                res.send(result);
            }
        }).catch(err => {
            logger.error(err);
            res.sendStatus(500);
        });
    });

module.exports = router;