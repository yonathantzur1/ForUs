const managementBL = require('../modules/BL/managementBL');
const general = require('../modules/general');

module.exports = function (app) {
    prefix = "/api/management";

    // Admin permissions check for all management routes
    app.use(prefix, function (req, res, next) {
        if (req.user.permissions.indexOf(general.PERMISSION.ADMIN) != -1) {
            next();
        }
        else {
            res.status(401).end();
        }
    });

    app.post(prefix + '/getUserByName', function (req, res) {
        var searchInput = req.body.searchInput;

        managementBL.GetUserByName(searchInput, function (result) {
            res.send(result);
        });
    });

    app.post(prefix + '/getUserFriends', function (req, res) {
        var friendsIds = req.body.friendsIds;

        managementBL.GetUserFriends(friendsIds, function (result) {
            res.send(result);
        });
    });

};