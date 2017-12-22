var profilePictureBL = require('../modules/BL/profilePictureBL');

module.exports = function (app) {
    prefix = "/api/profilePicture";

    // Get user profile image.
    app.get(prefix + '/getUserProfileImage', function (req, res) {
        var userId;

        profileId = req.user.profile;

        profilePictureBL.GetUserProfileImage(profileId, function (result) {
            res.send(result);
        });
    });
};