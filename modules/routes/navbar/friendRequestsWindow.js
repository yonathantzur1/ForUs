const friendRequestsWindowBL = require('../../BL/navbar/friendRequestsWindowBL');
const logger = require('../../../logger');

let prefix = "/api/friendRequestsWindow";

module.exports = function (app) {
    // Get all not empty chats order by last message time.
    app.put(prefix + '/removeRequestConfirmAlert', function (req, res) {
        let data = { userId: req.user._id, confirmedFriendsIds: req.body.confirmedFriendsIds };

        friendRequestsWindowBL.RemoveRequestConfirmAlert(data).then((result) => {
            res.send(result);
        }).catch((err) => {
            logger.error(err);
            res.sendStatus(500);
        });
    });
};