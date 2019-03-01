const profileBL = require('../../BL/profilePicture/profilePictureEditBL');
const tokenHandler = require("../../handlers/tokenHandler");
const logger = require('../../../logger');

let prefix = "/api/profile";

module.exports = function (app) {    
    // Add new profile image.
    app.post(prefix + '/saveImage', function (req, res) {
        let imageData = req.body;

        imageData.userId = req.user._id;

        profileBL.SaveImage(imageData).then((result) => {
            if (result) {
                req.user.profile = result.profile.toString();
                let token = tokenHandler.GetTokenFromUserObject(req.user);
                tokenHandler.SetTokenOnCookie(token, res);
                res.send(true);
            }
            else {
                res.send(result);
            }
        }).catch((err) => {
            logger.error(err);
            res.sendStatus(500);
        });
    });

    // Delete the user profile image.
    app.delete(prefix + '/deleteImage', function (req, res) {
        let userId = req.user._id;
        let profileId = req.user.profile;

        profileBL.DeleteImage(userId, profileId).then((result) => {
            if (result) {
                delete req.user.profile;
                let token = tokenHandler.GetTokenFromUserObject(req.user);
                tokenHandler.SetTokenOnCookie(token, res);
                res.send(true);
            }
            else {
                res.send(result);
            }
        }).catch((err) => {
            logger.error(err);
            res.sendStatus(500);
        });
    });
};