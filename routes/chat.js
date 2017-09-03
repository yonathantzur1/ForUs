module.exports = function (app, chatBL) {
    prefix = "/api/chat";

    // Checking if the session of the user is open.
    app.post(prefix + '/getChat', function (req, res) {
        chatBL.GetChat(req.body.membersIds, req.body.token, function (chat) {
            res.send(chat);
        })
    });

};