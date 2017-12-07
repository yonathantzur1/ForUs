var general = require('../modules/general.js');

module.exports = function (app, chatBL) {
    prefix = "/api/chat";

    // Checking if the session of the user is open.
    app.post(prefix + '/getChat', function (req, res) {
        chatBL.GetChat(req.body.membersIds, general.GetTokenFromRequest(req), function (chat) {
            res.send(chat);
        })
    });

};