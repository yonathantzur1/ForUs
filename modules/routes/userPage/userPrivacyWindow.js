const userPrivacyWindowBL = require('../../BL/userPage/userPrivacyWindowBL');
const validate = require('../../security/validate');
const events = require('../../events');

var prefix = "/api/userPrivacyWindow";

module.exports = function (app) {
    // Get user privacy status (is user private  - true/false).
    app.get(prefix + '/getUserPrivacyStatus', (req, res) => {
        userPrivacyWindowBL.GetUserPrivacyStatus(req.user._id).then(result => {
            res.send(result);
        }).catch(err => {
            res.status(500).end();
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
                res.status(500).end();
            });
        });

}