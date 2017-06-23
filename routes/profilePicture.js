module.exports = function (app, profilePictureBL) {
    // Get user profile image.
    app.get('/getUserProfileImage', function (req, res) {
        var userId;

        // In case the user was not found on session
        if (!req.session.user) {
            res.send(null);
        }
        else {
            profileId = req.session.user.profile;

            profilePictureBL.GetUserProfileImage(profileId, function (result) {
                res.send(result);
            });
        }
    });
};