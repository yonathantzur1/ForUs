const userPrivacyWindowBL = require('../../BL/userPage/userPrivacyWindowBL');

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

    app.put(prefix + '/setUserPrivacy', (req, res) => {
        userPrivacyWindowBL.SetUserPrivacy(req.user._id, req.body.isPrivate).then(result => {
            res.send(result);
        }).catch(err => {
            res.status(500).end();
        });
    });

}