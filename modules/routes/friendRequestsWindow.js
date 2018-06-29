const friendRequestsWindowBL = require('../BL/friendRequestsWindowBL');

module.exports = function (app) {
    prefix = "/api/friendRequestsWindow";

    // Get all not empty chats order by last message time.
    app.put(prefix + '/removeRequestConfirmAlert', function (req, res) {
        var data = { userId: req.user._id, confirmedFriendsIds: req.body.confirmedFriendsIds };
        
        friendRequestsWindowBL.RemoveRequestConfirmAlert(data).then((result) => {
            res.send(result);
        }).catch((err) => {
            res.status(500).end();
        });
    });
};