module.exports = function (app, navbarBL) {

    prefix = "/api/navbar";

    app.post(prefix + '/getFriends', function (req, res) {
        navbarBL.GetFriends(req.body, function (friends) {
            res.send(friends);
        });
    });

    // Getting search result for the main search.
    app.post(prefix + '/getMainSearchResults', function (req, res) {
        navbarBL.GetMainSearchResults(req.body.searchInput, req.body.searchLimit, function (results) {
            res.send(results);
        });
    });

    // Getting search result profiles for the main search.
    app.post(prefix + '/getMainSearchResultsWithImages', function (req, res) {
        navbarBL.GetMainSearchResultsWithImages(req.body.ids, function (profiles) {
            res.send(profiles);
        });
    });

    app.get(prefix + '/getUserMessagesNotifications', function (req, res) {
        navbarBL.GetUserMessagesNotifications(req.user._id, function (messagesNotifications) {
            res.send(messagesNotifications);
        });
    });

    app.post(prefix + '/updateMessagesNotifications', function (req, res) {
        navbarBL.UpdateMessagesNotifications(req.user._id, req.body.messagesNotifications, req.body.friendId);
    });
};