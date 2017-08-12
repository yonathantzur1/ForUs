var jwt = require('jsonwebtoken');
var config = require('../modules/config.js');

module.exports = function (app) {
    prefix = "/api/auth";

    // Checking if the session of the user is open.
    app.get(prefix + '/isUserOnSession', function (req, res) {
        if (req.user) {
            var tokenObj = { "user": req.user, "ip": req.ip };
            var token = jwt.sign(tokenObj, config.jwtSecret, config.jwtOptions);
            res.send({ "token": token });
        }
        else {
            res.send(false);
        }
    });

    // Getting the current login user name.
    app.get(prefix + '/getCurrUserName', function (req, res) {
        if (req.user) {
            var name = {
                "firstName": req.user.firstName,
                "lastName": req.user.lastName
            }

            res.send(name);
        }
        else {
            res.send(null);
        }
    });
};