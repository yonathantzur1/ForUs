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
        managementBL.GetUserByName(req.body.searchInput, function (result) {
            res.send(result);
        });
    });

    app.post(prefix + '/getUserFriends', function (req, res) {
        managementBL.GetUserFriends(req.body.friendsIds, function (result) {
            res.send(result);
        });
    });

    app.put(prefix + '/editUser', function (req, res) {
        managementBL.UpdateUser(req.body.updateFields, function (result) {
            res.send(result);
        });
    });

    app.put(prefix + '/blockUser', function (req, res) {
        managementBL.BlockUser(req.body.blockObj, function (result) {
            res.send(result);
        });
    });

    app.put(prefix + '/unblockUser', function (req, res) {
        managementBL.UnblockUser(req.body.userId, function (result) {
            res.send(result);
        });
    });

    app.delete(prefix + '/removeFriends', function (req, res) {
        managementBL.RemoveFriends(req.query.userId, req.query.friendId, function (result) {
            res.send(result);
        });
    });

    app.delete(prefix + '/deleteUser', function (req, res) {
        managementBL.DeleteUser(req.query.userId, function (result) {
            res.send(result);
        });
    });

};