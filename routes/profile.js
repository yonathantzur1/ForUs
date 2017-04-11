module.exports = function (app, profileBL) {
    // Add new profile image.
    app.post('/saveImage', function (req, res) {
        var imageData = req.body;

        // In case the user was not found on session
        if (!req.session.currUser) {
            res.send(null);
        }
        else {
            imageData.userId = req.session.currUser._id;

            profileBL.SaveImage(imageData, function (result) {
                if (result) {
                    req.session.currUser.profile = result.profile.toString();
                }

                res.send(result);
            });
        }
    });
};