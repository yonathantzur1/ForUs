const chatsWindowBL = require('../modules/BL/chatsWindowBL');

module.exports = function (app) {
    prefix = "/api/chatsWindow";

    // Get all not empty chats order by last message time.
    app.get(prefix + '/getAllChats', function (req, res) {
        chatsWindowBL.GetAllChats(req.user._id).then((chats) => {
            res.send(chats);
        }).catch((err) => {
            res.status(500).end();
        });
    });
};