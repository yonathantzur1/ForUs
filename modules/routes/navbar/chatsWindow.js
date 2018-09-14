const chatsWindowBL = require('../../BL/chatsWindowBL');

var prefix = "/api/chatsWindow";

module.exports = function (app) {    
    // Get all not empty chats order by last message time.
    app.get(prefix + '/getAllChats', function (req, res) {
        chatsWindowBL.GetAllChats(req.user._id).then((chats) => {
            res.send(chats);
        }).catch((err) => {
            res.status(500).end();
        });
    });
};