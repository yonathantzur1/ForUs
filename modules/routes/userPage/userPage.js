const router = require('express').Router();
const userPageBL = require('../../BL/userPage/userPageBL');
const errorHandler = require('../../handlers/errorHandler');

// Get user details by id.
router.get('/getUserDetails', function (req, res) {
    let userId = req.query.id;
    let currUserId = req.user._id;

    userPageBL.getUserDetails(userId, currUserId).then(result => {
        res.send(result);
    }).catch(err => {
        errorHandler.routeError(err, res);
    });
});

// Remove friend.
router.delete('/removeFriends', function (req, res) {
    let currUserId = req.user._id;
    let friendId = req.query.friendId;

    userPageBL.removeFriends(currUserId, friendId).then(result => {
        res.send(result);
    }).catch(err => {
        errorHandler.routeError(err, res);
    });
});

router.put('/deleteUserValidation', function (req, res) {
    userPageBL.deleteUserValidation(req.user._id).then(result => {
        res.send(result);
    }).catch((err) => {
        errorHandler.routeError(err, res);
    });
});

module.exports = router;