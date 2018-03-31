const friendRequestsWindowBL = require('../modules/BL/friendRequestsWindowBL');

module.exports = function (app) {
    prefix = "/api/friendRequestsWindow";

    // Get all not empty chats order by last message time.
    app.put(prefix + '/removeRequestConfirmAlert', function (req, res) {
        var data = { userId: req.user._id, confirmedFriendsIds: req.body.confirmedFriendsIds };
        
        friendRequestsWindowBL.RemoveRequestConfirmAlert(data, function (result) {
            res.send(result);
        });
    });
};