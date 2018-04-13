const chatBL = require('../modules/BL/chatBL');
const general = require('../modules/general');

module.exports = function (app) {
    prefix = "/api/chat";

    // Return the first chat page messages.
    app.post(prefix + '/getChat', function (req, res) {
        chatBL.GetChat(req.body.membersIds, req.user, function (chat) {
            res.send(chat);
        })
    });

    // Return the requested chat page messages.
    app.post(prefix + '/getChatPage', function (req, res) {
        chatBL.GetChatPage(req.body.membersIds,
            req.user,
            req.body.currMessagesNum,
            req.body.totalMessagesNum,
            function (chat) {
                res.send(chat);
            })
    });

};