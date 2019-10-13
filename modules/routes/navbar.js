const router = require('express').Router();
const navbarBL = require('../BL/navbarBL');
const tokenHandler = require("../handlers/tokenHandler");
const errorHandler = require('../handlers/errorHandler');

router.post('/getFriends', function (req, res) {
    navbarBL.getFriends(req.body).then((friends) => {
        res.send(friends);
    }).catch((err) => {
        errorHandler.routeError(err, res);
    });
});

// Getting search result for the main search.
router.post('/getMainSearchResults', function (req, res) {
    navbarBL.getMainSearchResults(req.body.searchInput, req.user._id).then((results) => {
        res.send(results);
    }).catch((err) => {
        errorHandler.routeError(err, res);
    });
});

// Getting search result profiles for the main search.
router.post('/getMainSearchResultsWithImages', function (req, res) {
    navbarBL.getMainSearchResultsWithImages(req.body).then((profiles) => {
        res.send(profiles);
    }).catch((err) => {
        errorHandler.routeError(err, res);
    });
});

router.get('/getUserMessagesNotifications', function (req, res) {
    navbarBL.getUserMessagesNotifications(req.user._id).then((messagesNotifications) => {
        res.send(messagesNotifications);
    }).catch((err) => {
        errorHandler.routeError(err, res);
    });
});

router.post('/updateMessagesNotifications', function (req, res) {
    navbarBL.updateMessagesNotifications(req.user._id, req.body.messagesNotifications);
    res.end();
});

router.post('/removeMessagesNotifications', function (req, res) {
    navbarBL.removeMessagesNotifications(req.user._id, req.body.messagesNotifications);
    res.end();
});

router.get('/getUserFriendRequests', function (req, res) {
    navbarBL.getUserFriendRequests(req.user._id).then((friendRequests) => {
        res.send(friendRequests);
    }).catch((err) => {
        errorHandler.routeError(err, res);
    });
});

router.post('/addFriendRequest', function (req, res) {
    navbarBL.addFriendRequest(req.user, req.body.friendId).then((result) => {
        res.send(result);
    }).catch((err) => {
        errorHandler.routeError(err, res);
    });
});

router.post('/removeFriendRequest', function (req, res) {
    navbarBL.removeFriendRequest(req.user._id, req.body.friendId).then((result) => {
        res.send(result);
    }).catch((err) => {
        errorHandler.routeError(err, res);
    });
});

router.post('/ignoreFriendRequest', function (req, res) {
    navbarBL.ignoreFriendRequest(req.user._id, req.body.friendId).then((result) => {
        res.send(result);
    }).catch((err) => {
        errorHandler.routeError(err, res);
    });
});

router.post('/addFriend', function (req, res) {
    navbarBL.addFriend(req.user, req.body.friendId).then((result) => {
        if (result) {
            tokenHandler.setTokenOnCookie(result.token, res);
            res.send(result.friend);
        }
    }).catch((err) => {
        errorHandler.routeError(err, res);
    });
});

router.put('/removeFriendRequestConfirmAlert', function (req, res) {
    let data = { userId: req.user._id, confirmedFriendsIds: req.body.confirmedFriendsIds };

    navbarBL.removeFriendRequestConfirmAlert(data).then((result) => {
        res.send(result);
    }).catch((err) => {
        errorHandler.routeError(err, res);
    });
});

module.exports = router;