module.exports = function (app, unreadWindowBL) {
    prefix = "/api/unreadWindow";

    // Get all not empty chats order by last message time.
    app.get(prefix + '/getAllChats', function (req, res) {
        unreadWindowBL.GetAllChats(req.user._id, function (chats) {
            res.send(chats);
        });
    });
};