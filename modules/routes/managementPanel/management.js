const router = require('express').Router();
const managementBL = require('../../BL/managementPanel/managementBL');
const permissionHandler = require('../../handlers/permissionHandler');
const logger = require('../../../logger');

router.post('/getUserByName',
    (req, res, next) => {
        req.body.searchInput = req.body.searchInput.toLowerCase();
        next();
    },
    (req, res) => {
        managementBL.GetUserByName(req.body.searchInput).then((result) => {
            res.send(result);
        }).catch((err) => {
            logger.error(err);
            res.sendStatus(500);
        });
    });

router.post('/getUserFriends', function (req, res) {
    managementBL.GetUserFriends(req.body.friendsIds).then((result) => {
        res.send(result);
    }).catch((err) => {
        logger.error(err);
        res.sendStatus(500);
    });
});

router.put('/editUser', function (req, res) {
    managementBL.UpdateUser(req.user._id, req.body.updateFields).then((result) => {
        res.send(result);
    }).catch((err) => {
        logger.error(err);
        res.sendStatus(500);
    });
});

router.put('/blockUser', function (req, res) {
    managementBL.BlockUser(req.user._id, req.body.blockObj).then((result) => {
        res.send(result);
    }).catch((err) => {
        logger.error(err);
        res.sendStatus(500);
    });
});

router.put('/unblockUser', function (req, res) {
    managementBL.UnblockUser(req.body.userId).then((result) => {
        res.send(result);
    }).catch((err) => {
        logger.error(err);
        res.sendStatus(500);
    });
});

router.delete('/removeFriends', function (req, res) {
    managementBL.RemoveFriends(req.user._id, req.query.userId, req.query.friendId).then((result) => {
        res.send(result);
    }).catch((err) => {
        logger.error(err);
        res.sendStatus(500);
    });
});

router.delete('/deleteUser', function (req, res) {
    // Checking master permission.
    if (permissionHandler.IsUserHasMasterPermission(req.user.permissions)) {
        managementBL.DeleteUser(req.query.userId,
            req.query.userFirstName,
            req.query.userLastName).then((result) => {
                res.send(result);
            }).catch((err) => {
                logger.error(err);
                res.sendStatus(500);
            });
    }
    else {
        res.sendStatus(401);
    }
});

module.exports = router;