const router = require('express').Router();
const userPageBL = require('../../BL/userPage/userPageBL');
const logger = require('../../../logger');

// Get user details by id.
router.get('/getUserDetails', function (req, res) {
    let userId = req.query.id;
    let currUserId = req.user._id;

    userPageBL.GetUserDetails(userId, currUserId).then(result => {
        res.send(result);
    }).catch(err => {
        logger.error(err);
        res.sendStatus(500);
    });
});

// Remove friend.
router.delete('/removeFriends', function (req, res) {
    let currUserId = req.user._id;
    let friendId = req.query.friendId;

    userPageBL.RemoveFriends(currUserId, friendId).then(result => {
        res.send(result);
    }).catch(err => {
        logger.error(err);
        res.sendStatus(500);
    });
});

router.put('/deleteUserValidation', function (req, res) {
    userPageBL.DeleteUserValidation(req.user._id).then(result => {
        res.send(result);
    }).catch((err) => {
        logger.error(err);
        res.sendStatus(500);
    });
});

module.exports = router;