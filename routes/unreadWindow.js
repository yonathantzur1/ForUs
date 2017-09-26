module.exports = function (app, unreadWindowBL) {

    prefix = "/api/unreadWindow";

    // Get all not empty chats order by last message time.
    app.get(prefix + '/getAllChats', function (req, res) {
        unreadWindowBL.GetAllChats(function (chats) {
            res.send(chats);
        });
    });
};