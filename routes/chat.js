const chatBL = require('../modules/BL/chatBL');
const general = require('../modules/general');

module.exports = function (app) {
    prefix = "/api/chat";

    // Checking if the session of the user is open.
    app.post(prefix + '/getChat', function (req, res) {
        chatBL.GetChat(req.body.membersIds, general.GetTokenFromRequest(req), function (chat) {
            res.send(chat);
        })
    });

};