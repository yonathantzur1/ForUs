const router = require('express').Router();
const userPrivacyWindowBL = require('../../BL/userPage/userPrivacyWindowBL');
const validation = require('../../security/validation');
const events = require('../../events');
const logger = require('../../../logger');

// Get user privacy status (is user private  - true/false).
router.get('/getUserPrivacyStatus', (req, res) => {
    userPrivacyWindowBL.getUserPrivacyStatus(req.user._id).then(result => {
        res.send(result);
    }).catch(err => {
        logger.error(err);
        res.sendStatus(500);
    });
});

router.put('/setUserPrivacy',
    validation,
    (req, res) => {
        userPrivacyWindowBL.setUserPrivacy(req.user._id, req.body.isPrivate).then(result => {
            if (req.body.isPrivate && result) {
                events.emit('socket.UserSetToPrivate', req.user._id);
            }

            res.send(result);
        }).catch(err => {
            logger.error(err);
            res.sendStatus(500);
        });
    });

module.exports = router;