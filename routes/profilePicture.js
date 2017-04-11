module.exports = function (app, profilePictureBL) {
    // Get user profile image.
    app.get('/getUserProfileImage', function (req, res) {
        var userId;

        // In case the user was not found on session
        if (!req.session.currUser) {
            res.send(null);
        }
        else {
            profileId = req.session.currUser.profile;

            profilePictureBL.GetUserProfileImage(profileId, function (result) {
                res.send(result);
            });
        }
    });
};