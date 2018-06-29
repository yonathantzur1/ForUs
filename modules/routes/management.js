const managementBL = require('../BL/managementBL');
const general = require('../general');

module.exports = function (app) {
    prefix = "/api/management";

    // Root permissions check for all management routes
    app.use(prefix, function (req, res, next) {
        if (general.IsUserHasRootPermission(req.user.permissions)) {
            next();
        }
        else {
            res.status(401).end();
        }
    });

    app.post(prefix + '/getUserByName', function (req, res) {
        managementBL.GetUserByName(req.body.searchInput).then((result) => {
            res.send(result);
        }).catch((err) => {
            res.status(500).end();
        });
    });

    app.post(prefix + '/getUserFriends', function (req, res) {
        managementBL.GetUserFriends(req.body.friendsIds).then((result) => {
            res.send(result);
        }).catch((err) => {
            res.status(500).end();
        });
    });

    app.put(prefix + '/editUser', function (req, res) {
        managementBL.UpdateUser(req.body.updateFields).then((result) => {
            res.send(result);
        }).catch((err) => {
            res.status(500).end();
        });
    });

    app.put(prefix + '/blockUser', function (req, res) {
        managementBL.BlockUser(req.body.blockObj).then((result) => {
            res.send(result);
        }).catch((err) => {
            res.status(500).end();
        });
    });

    app.put(prefix + '/unblockUser', function (req, res) {
        managementBL.UnblockUser(req.body.userId).then((result) => {
            res.send(result);
        }).catch((err) => {
            res.status(500).end();
        });
    });

    app.delete(prefix + '/removeFriends', function (req, res) {
        managementBL.RemoveFriends(req.query.userId, req.query.friendId).then((result) => {
            res.send(result);
        }).catch((err) => {
            res.status(500).end();
        });
    });

    app.delete(prefix + '/deleteUser', function (req, res) {
        // Checking master permission for this route.
        if (general.IsUserHasMasterPermission(req.user.permissions)) {
            managementBL.DeleteUser(req.query.userId).then((result) => {
                res.send(result);
            }).catch((err) => {
                res.status(500).end();
            });
        }
        else {
            res.status(401).end();
        }
    });

};