const profileBL = require('../../BL/profilePicture/profilePictureEditBL');
const tokenHandler = require("../../handlers/tokenHandler");

var prefix = "/api/profile";

module.exports = function (app) {    
    // Add new profile image.
    app.post(prefix + '/saveImage', function (req, res) {
        var imageData = req.body;

        imageData.userId = req.user._id;

        profileBL.SaveImage(imageData).then((result) => {
            if (result) {
                req.user.profile = result.profile.toString();
                var token = tokenHandler.GetTokenFromUserObject(req.user);
                tokenHandler.SetTokenOnCookie(token, res);
                res.send(true);
            }
            else {
                res.send(result);
            }
        }).catch((err) => {
            res.status(500).end();
        });
    });

    // Delete the user profile image.
    app.delete(prefix + '/deleteImage', function (req, res) {
        var userId = req.user._id;
        var profileId = req.user.profile;

        profileBL.DeleteImage(userId, profileId).then((result) => {
            if (result) {
                delete req.user.profile;
                var token = tokenHandler.GetTokenFromUserObject(req.user);
                tokenHandler.SetTokenOnCookie(token, res);
                res.send(true);
            }
            else {
                res.send(result);
            }
        }).catch((err) => {
            res.status(500).end();
        });
    });
};