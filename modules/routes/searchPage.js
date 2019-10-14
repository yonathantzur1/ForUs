const router = require('express').Router();
const searchPageBL = require('../BL/searchPageBL');
const errorHandler = require('../handlers/errorHandler');

router.get('/getSearchResults', (req, res) => {
    let input = req.query.input;

    searchPageBL.getSearchPageResults(input, req.user._id).then(result => {
        res.send(result);
    }).catch(err => {
        errorHandler.routeError(err, res);
    });
});

router.get('/getUserFriendsStatus', (req, res) => {
    searchPageBL.getUserFriendRequests(req.user._id).then(result => {
        let friendsStatus = result.friendRequests;
        friendsStatus.friends = req.user.friends;
        res.send(friendsStatus);
    }).catch(err => {
        errorHandler.routeError(err, res);
    });
});

module.exports = router;