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
        managementBL.getUserByName(req.body.searchInput).then((result) => {
            res.send(result);
        }).catch((err) => {
            logger.error(err);
            res.sendStatus(500);
        });
    });

router.post('/getUserFriends', function (req, res) {
    managementBL.getUserFriends(req.body.friendsIds).then((result) => {
        res.send(result);
    }).catch((err) => {
        logger.error(err);
        res.sendStatus(500);
    });
});

router.put('/editUser', function (req, res) {
    managementBL.updateUser(req.user._id, req.body.updateFields).then((result) => {
        res.send(result);
    }).catch((err) => {
        logger.error(err);
        res.sendStatus(500);
    });
});

router.put('/blockUser', function (req, res) {
    managementBL.blockUser(req.user._id, req.body.blockObj).then((result) => {
        res.send(result);
    }).catch((err) => {
        logger.error(err);
        res.sendStatus(500);
    });
});

router.put('/unblockUser', function (req, res) {
    managementBL.unblockUser(req.body.userId).then((result) => {
        res.send(result);
    }).catch((err) => {
        logger.error(err);
        res.sendStatus(500);
    });
});

router.delete('/removeFriends', function (req, res) {
    managementBL.removeFriends(req.user._id, req.query.userId, req.query.friendId).then((result) => {
        res.send(result);
    }).catch((err) => {
        logger.error(err);
        res.sendStatus(500);
    });
});

router.delete('/deleteUser', function (req, res) {
    // Checking master permission.
    if (permissionHandler.isUserHasMasterPermission(req.user.permissions)) {
        managementBL.deleteUser(req.query.userId,
            req.query.userFirstName,
            req.query.userLastName,
            req.query.userEmail,
            req).then((result) => {
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