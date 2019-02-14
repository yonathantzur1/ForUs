const navbarBL = require('../../BL/navbar/navbarBL');
const tokenHandler = require("../../handlers/tokenHandler");
const logger = require('../../../logger');

let prefix = "/api/navbar";

module.exports = function (app) {

    app.post(prefix + '/getFriends', function (req, res) {
        navbarBL.GetFriends(req.body).then((friends) => {
            res.send(friends);
        }).catch((err) => {
            logger.error(err);
            res.status(500).end();
        });
    });

    // Getting search result for the main search.
    app.post(prefix + '/getMainSearchResults', function (req, res) {
        navbarBL.GetMainSearchResults(req.body.searchInput, req.user._id).then((results) => {
            res.send(results);
        }).catch((err) => {
            logger.error(err);
            res.status(500).end();
        });
    });

    // Getting search result profiles for the main search.
    app.post(prefix + '/getMainSearchResultsWithImages', function (req, res) {
        navbarBL.GetMainSearchResultsWithImages(req.body).then((profiles) => {
            res.send(profiles);
        }).catch((err) => {
            logger.error(err);
            res.status(500).end();
        });
    });

    app.get(prefix + '/getUserMessagesNotifications', function (req, res) {
        navbarBL.GetUserMessagesNotifications(req.user._id).then((messagesNotifications) => {
            res.send(messagesNotifications);
        }).catch((err) => {
            logger.error(err);
            res.status(500).end();
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
        navbarBL.GetUserFriendRequests(req.user._id).then((friendRequests) => {
            res.send(friendRequests);
        }).catch((err) => {
            logger.error(err);
            res.status(500).end();
        });
    });

    app.post(prefix + '/addFriendRequest', function (req, res) {
        navbarBL.AddFriendRequest(req.user, req.body.friendId).then((result) => {
            res.send(result);
        }).catch((err) => {
            logger.error(err);
            res.status(500).end();
        });
    });

    app.post(prefix + '/removeFriendRequest', function (req, res) {
        navbarBL.RemoveFriendRequest(req.user._id, req.body.friendId).then((result) => {
            res.send(result);
        }).catch((err) => {
            logger.error(err);
            res.status(500).end();
        });
    });

    app.post(prefix + '/ignoreFriendRequest', function (req, res) {
        navbarBL.IgnoreFriendRequest(req.user._id, req.body.friendId).then((result) => {
            res.send(result);
        }).catch((err) => {
            logger.error(err);
            res.status(500).end();
        });
    });

    app.post(prefix + '/addFriend', function (req, res) {
        navbarBL.AddFriend(req.user, req.body.friendId).then((result) => {
            if (result) {
                tokenHandler.SetTokenOnCookie(result.token, res);
                res.send(result.friend);
            }
        }).catch((err) => {
            logger.error(err);
            res.status(500).end();
        });
    });
};