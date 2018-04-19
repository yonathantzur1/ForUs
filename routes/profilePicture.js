const profilePictureBL = require('../modules/BL/profilePictureBL');

module.exports = function (app) {
    prefix = "/api/profilePicture";

    // Get user profile image.
    app.get(prefix + '/getUserProfileImage', function (req, res) {
        var userId;

        profileId = req.user.profile;

        profilePictureBL.GetUserProfileImage(profileId).then((result) => {
            res.send(result);
        }).catch((err) => {
            res.status(500).end();
        });
    });
};