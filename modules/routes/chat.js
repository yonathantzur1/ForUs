const chatBL = require('../BL/chatBL');
const general = require('../general');

module.exports = (app) => {
    prefix = "/api/chat";

    // Return the first chat page messages.
    app.post(prefix + '/getChat', (req, res) => {
        chatBL.GetChat(req.body.membersIds, req.user).then((chat) => {
            res.send(chat);
        }).catch((err) => {
            res.status(500).end();
        })
    });

    // Return the requested chat page messages.
    app.post(prefix + '/getChatPage', (req, res) => {
        chatBL.GetChatPage(req.body.membersIds,
            req.user,
            req.body.currMessagesNum,
            req.body.totalMessagesNum).then((chat) => {
                res.send(chat);
            }).catch((err) => {
                res.status(500).end();
            })
    });
};