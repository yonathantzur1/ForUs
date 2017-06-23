module.exports = function (app, profileBL) {
    // Add new profile image.
    app.post('/saveImage', function (req, res) {
        var imageData = req.body;

        // In case the user was not found on session
        if (!req.session.user) {
            res.send(null);
        }
        else {
            imageData.userId = req.session.user._id;

            profileBL.SaveImage(imageData, function (result) {
                if (result) {
                    req.session.user.profile = result.profile.toString();
                }

                res.send(result);
            });
        }
    });

    // Delete the user profile image.
    app.delete('/deleteImage', function (req, res) {
        // In case the user was not found on session
        if (!req.session.user) {
            res.send(null);
        }
        else {
            var userId = req.session.user._id;
            var profileId = req.session.user.profile;

            profileBL.DeleteImage(userId, profileId, function (result) {
                if (result) {
                    delete req.session.user.profile;
                }

                res.send(result);
            });
        }
    });
};