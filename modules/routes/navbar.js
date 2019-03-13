const router = require('express').Router();
const navbarBL = require('../BL/navbarBL');
const tokenHandler = require("../handlers/tokenHandler");
const logger = require('../../logger');

router.post('/getFriends', function (req, res) {
    navbarBL.GetFriends(req.body).then((friends) => {
        res.send(friends);
    }).catch((err) => {
        logger.error(err);
        res.sendStatus(500);
    });
});

// Getting search result for the main search.
router.post('/getMainSearchResults', function (req, res) {
    navbarBL.GetMainSearchResults(req.body.searchInput, req.user._id).then((results) => {
        res.send(results);
    }).catch((err) => {
        logger.error(err);
        res.sendStatus(500);
    });
});

// Getting search result profiles for the main search.
router.post('/getMainSearchResultsWithImages', function (req, res) {
    navbarBL.GetMainSearchResultsWithImages(req.body).then((profiles) => {
        res.send(profiles);
    }).catch((err) => {
        logger.error(err);
        res.sendStatus(500);
    });
});

router.get('/getUserMessagesNotifications', function (req, res) {
    navbarBL.GetUserMessagesNotifications(req.user._id).then((messagesNotifications) => {
        res.send(messagesNotifications);
    }).catch((err) => {
        logger.error(err);
        res.sendStatus(500);
    });
});

router.post('/updateMessagesNotifications', function (req, res) {
    navbarBL.UpdateMessagesNotifications(req.user._id, req.body.messagesNotifications);
    res.end();
});

router.post('/removeMessagesNotifications', function (req, res) {
    navbarBL.RemoveMessagesNotifications(req.user._id, req.body.messagesNotifications);
    res.end();
});

router.get('/getUserFriendRequests', function (req, res) {
    navbarBL.GetUserFriendRequests(req.user._id).then((friendRequests) => {
        res.send(friendRequests);
    }).catch((err) => {
        logger.error(err);
        res.sendStatus(500);
    });
});

router.post('/addFriendRequest', function (req, res) {
    navbarBL.AddFriendRequest(req.user, req.body.friendId).then((result) => {
        res.send(result);
    }).catch((err) => {
        logger.error(err);
        res.sendStatus(500);
    });
});

router.post('/removeFriendRequest', function (req, res) {
    navbarBL.RemoveFriendRequest(req.user._id, req.body.friendId).then((result) => {
        res.send(result);
    }).catch((err) => {
        logger.error(err);
        res.sendStatus(500);
    });
});

router.post('/ignoreFriendRequest', function (req, res) {
    navbarBL.IgnoreFriendRequest(req.user._id, req.body.friendId).then((result) => {
        res.send(result);
    }).catch((err) => {
        logger.error(err);
        res.sendStatus(500);
    });
});

router.post('/addFriend', function (req, res) {
    navbarBL.AddFriend(req.user, req.body.friendId).then((result) => {
        if (result) {
            tokenHandler.SetTokenOnCookie(result.token, res);
            res.send(result.friend);
        }
    }).catch((err) => {
        logger.error(err);
        res.sendStatus(500);
    });
});

router.put('/removeFriendRequestConfirmAlert', function (req, res) {
    let data = { userId: req.user._id, confirmedFriendsIds: req.body.confirmedFriendsIds };

    navbarBL.RemoveFriendRequestConfirmAlert(data).then((result) => {
        res.send(result);
    }).catch((err) => {
        logger.error(err);
        res.sendStatus(500);
    });
});

module.exports = router;