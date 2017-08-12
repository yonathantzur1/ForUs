var general = require('../modules/general.js');

module.exports = function (app, profileBL) {

    prefix = "/api/profile";

    // Add new profile image.
    app.post(prefix + '/saveImage', function (req, res) {
        var imageData = req.body;

        imageData.userId = req.user._id;

        profileBL.SaveImage(imageData, function (result) {
            if (result) {
                req.user.profile = result.profile.toString();
                var token =  general.GetTokenFromUserObject(req.user, req);
                res.send({ "token": token });
            }
            else {
                res.send(result);
            }
        });
    });

    // Delete the user profile image.
    app.delete(prefix + '/deleteImage', function (req, res) {
        var userId = req.user._id;
        var profileId = req.user.profile;

        profileBL.DeleteImage(userId, profileId, function (result) {
            if (result) {
                delete req.user.profile;
                var token =  general.GetTokenFromUserObject(req.user, req);
                res.send({ "token": token });
            }
            else {
                res.send(result);
            }
        });
    });
};