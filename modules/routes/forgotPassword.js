const forgotPasswordBL = require('../BL/forgotPasswordBL');
const tokenHandler = require('../handlers/tokenHandler');
const validate = require('../security/validate');

var prefix = "/forgotPassword";

module.exports = (app) => {

    app.get(prefix + '/validateResetPasswordToken',
        validate,
        (req, res) => {
            tokenHandler.DeleteAuthCookies(res);
            forgotPasswordBL.ValidateResetPasswordToken(req.query.token).then(result => {
                res.send(result ? { name: (result.firstName + " " + result.lastName) } : false);
            }).catch(err => {
                res.status(500).end();
            });
        });

    // Changing user password in DB by token.
    app.put(prefix + '/resetPasswordByToken',
        validate,
        (req, res) => {
            forgotPasswordBL.ResetPasswordByToken(req.body).then(result => {
                if (result) {
                    var token = tokenHandler.GetTokenFromUserObject(result);
                    tokenHandler.SetTokenOnCookie(token, res, true);
                    res.send(true);
                }
                else {
                    res.send(result);
                }
            }).catch(err => {
                res.status(500).end();
            });
        });
};