const profilePictureBL = require('../../BL/profilePicture/profilePictureBL');

let prefix = "/api/profilePicture";

module.exports = function (app) {
    // Get user profile image.
    app.get(prefix + '/getUserProfileImage', function (req, res) {
        profileId = req.user.profile;

        profilePictureBL.GetUserProfileImage(profileId).then((result) => {
            res.send(result);
        }).catch((err) => {
            res.status(500).end();
        });
    });
};