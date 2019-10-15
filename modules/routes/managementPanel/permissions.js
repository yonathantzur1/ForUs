const router = require('express').Router();
const permissionsBL = require('../../BL/managementPanel/permissionsBL');
const errorHandler = require('../../handlers/errorHandler');

router.get('/getAllPermissions', (req, res) => {
    permissionsBL.getAllPermissions().then(result => {
        res.send(result);
    }).catch(err => {
        errorHandler.routeError(err, res);
    });
});

router.get('/getUserPermissions', (req, res) => {
    permissionsBL.getUserPermissions(req.query.userId).then(result => {
        res.send(result);
    }).catch(err => {
        errorHandler.routeError(err, res);
    });
});

router.put('/updatePermissions', (req, res) => {
    permissionsBL.updatePermissions(req.body.userId, req.body.permissions).then(result => {
        res.send(result);
    }).catch(err => {
        errorHandler.routeError(err, res);
    });
});

module.exports = router;