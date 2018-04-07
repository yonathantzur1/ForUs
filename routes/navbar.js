const navbarBL = require('../modules/BL/navbarBL');
const general = require("../modules/general");

module.exports = function (app) {

    prefix = "/api/navbar";

    app.post(prefix + '/getFriends', function (req, res) {
        navbarBL.GetFriends(req.body, function (friends) {
            res.send(friends);
        });
    });

    // Getting search result for the main search.
    app.post(prefix + '/getMainSearchResults', function (req, res) {
        navbarBL.GetMainSearchResults(req.body.searchInput, function (results) {
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
        navbarBL.UpdateMessagesNotifications(req.user._id, req.body.messagesNotifications);
        res.end();
    });

    app.post(prefix + '/removeMessagesNotifications', function (req, res) {
        navbarBL.RemoveMessagesNotifications(req.user._id, req.body.messagesNotifications);
        res.end();
    });

    app.get(prefix + '/getUserFriendRequests', function (req, res) {
        navbarBL.GetUserFriendRequests(req.user._id, function (friendRequests) {
            res.send(friendRequests);
        });
    });

    app.post(prefix + '/addFriendRequest', function (req, res) {
        navbarBL.AddFriendRequest(req.user, req.body.friendId, function (result) {
            res.send(result);
        });
    });

    app.post(prefix + '/removeFriendRequest', function (req, res) {
        navbarBL.RemoveFriendRequest(req.user._id, req.body.friendId, function (result) {
            res.send(result);
        });
    });

    app.post(prefix + '/ignoreFriendRequest', function (req, res) {
        navbarBL.IgnoreFriendRequest(req.user._id, req.body.friendId, function (result) {
            res.send(result);
        });
    });

    app.post(prefix + '/addFriend', function (req, res) {
        navbarBL.AddFriend(req.user, req.body.friendId, function (result) {
            if (result) {
                general.SetTokenOnCookie(result.token, res);
                res.send(result.friend);
            }
        });
    });
};