const router = require('express').Router();
const managementBL = require('../../BL/managementPanel/managementBL');
const permissionHandler = require('../../handlers/permissionHandler');
const errorHandler = require('../../handlers/errorHandler');

router.post('/getUserByName',
    (req, res, next) => {
        req.body.searchInput = req.body.searchInput.toLowerCase();
        next();
    },
    (req, res) => {
        managementBL.getUserByName(req.body.searchInput).then(result => {
            res.send(result);
        }).catch(err => {
            errorHandler.routeError(err, res);
        });
    });

router.post('/getUserFriends', (req, res) => {
    managementBL.getUserFriends(req.body.friendsIds).then(result => {
        res.send(result);
    }).catch(err => {
        errorHandler.routeError(err, res);
    });
});

router.put('/editUser', (req, res) => {
    managementBL.updateUser(req.user._id, req.body.updateFields).then(result => {
        res.send(result);
    }).catch(err => {
        errorHandler.routeError(err, res);
    });
});

router.put('/blockUser', (req, res) => {
    managementBL.blockUser(req.user._id, req.body.blockObj).then(result => {
        res.send(result);
    }).catch(err => {
        errorHandler.routeError(err, res);
    });
});

router.put('/unblockUser', (req, res) => {
    managementBL.unblockUser(req.body.userId).then(result => {
        res.send(result);
    }).catch(err => {
        errorHandler.routeError(err, res);
    });
});

router.delete('/removeFriends', (req, res) => {
    managementBL.removeFriends(req.user._id, req.query.userId, req.query.friendId).then(result => {
        res.send(result);
    }).catch(err => {
        errorHandler.routeError(err, res);
    });
});

router.delete('/deleteUser', (req, res) => {
    // Checking master permission.
    if (permissionHandler.isUserHasMasterPermission(req.user.permissions)) {
        managementBL.deleteUser(req.query.userId,
            req.query.userFirstName,
            req.query.userLastName,
            req.query.userEmail,
            req).then(result => {
                res.send(result);
            }).catch(err => {
                errorHandler.routeError(err, res);
            });
    }
    else {
        res.sendStatus(401);
    }
});

module.exports = router;