const userPageBL = require('../../BL/userPage/userPageBL');
const managementBL = require('../../BL/managementPanel/managementBL');
const events = require('../../events');

var prefix = "/api/userPage";

module.exports = function (app) {
    // Get user details by id.
    app.get(prefix + '/getUserDetails', function (req, res) {
        var userId = req.query.id;
        var currUserId = req.user._id;

        userPageBL.GetUserDetails(userId, currUserId).then(result => {
            res.send(result);
        }).catch(err => {
            res.status(500).end();
        });
    });

    // Remove friend.
    app.delete(prefix + '/removeFriends', function (req, res) {
        var currUserId = req.user._id;
        var friendId = req.query.friendId;

        userPageBL.RemoveFriends(currUserId, friendId).then(result => {
            res.send(result);
        }).catch(err => {
            res.status(500).end();
        });
    });

    app.put(prefix + '/deleteUserValidation', function (req, res) {
        userPageBL.DeleteUserValidation(req.user._id).then(result => {
            res.send(result);
        }).catch((err) => {
            res.status(500).end();
        });
    });

};