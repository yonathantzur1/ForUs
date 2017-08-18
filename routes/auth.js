var general = require('../modules/general.js');

module.exports = function (app) {
    prefix = "/api/auth";

    // Checking if the session of the user is open.
    app.get(prefix + '/isUserOnSession', function (req, res) {
        if (req.user) {
            var token = general.GetTokenFromUserObject(req.user, req);
            res.send({ "token": token });
        }
        else {
            res.send(false);
        }
    });

    // Getting the current login user.
    app.get(prefix + '/getCurrUser', function (req, res) {
        res.send(req.user);
    });
};