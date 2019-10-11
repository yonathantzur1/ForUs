const router = require('express').Router();
const permissionsBL = require('../../BL/managementPanel/permissionsBL');
const permissionHandler = require('../../handlers/permissionHandler');
const logger = require('../../../logger');

let prefix = "/api/permissions";

// Master permissions check for all management routes
router.use(prefix, function (req, res, next) {
    if (permissionHandler.isUserHasMasterPermission(req.user.permissions)) {
        next();
    }
    else {
        res.sendStatus(401);
    }
});

router.get('/getAllPermissions', function (req, res) {
    permissionsBL.GetAllPermissions().then((result) => {
        res.send(result);
    }).catch((err) => {
        logger.error(err);
        res.sendStatus(500);
    });
});

router.get('/getUserPermissions', function (req, res) {
    permissionsBL.GetUserPermissions(req.query.userId).then((result) => {
        res.send(result);
    }).catch((err) => {
        logger.error(err);
        res.sendStatus(500);
    });
});

router.put('/updatePermissions', function (req, res) {
    permissionsBL.UpdatePermissions(req.body.userId, req.body.permissions).then((result) => {
        res.send(result);
    }).catch((err) => {
        logger.error(err);
        res.sendStatus(500);
    });
});

module.exports = router;