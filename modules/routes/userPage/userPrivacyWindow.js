const userPrivacyWindowBL = require('../../BL/userPage/userPrivacyWindowBL');
const validate = require('../../security/validate');
const events = require('../../events');
const logger = require('../../../logger');

let prefix = "/api/userPrivacyWindow";

module.exports = function (app) {
    // Get user privacy status (is user private  - true/false).
    app.get(prefix + '/getUserPrivacyStatus', (req, res) => {
        userPrivacyWindowBL.GetUserPrivacyStatus(req.user._id).then(result => {
            res.send(result);
        }).catch(err => {
            logger.error(err);
            res.sendStatus(500);
        });
    });

    app.put(prefix + '/setUserPrivacy',
        validate,
        (req, res) => {
            userPrivacyWindowBL.SetUserPrivacy(req.user._id, req.body.isPrivate).then(result => {
                if (req.body.isPrivate && result) {
                    events.emit('socket.UserSetToPrivate', req.user._id);
                }

                res.send(result);
            }).catch(err => {
                logger.error(err);
                res.sendStatus(500);
            });
        });

}