const router = require('express').Router();
const profilePictureBL = require('../BL/profilePictureBL');
const logger = require('../../logger');
const tokenHandler = require("../handlers/tokenHandler");

// Get user profile image.
router.get('/getUserProfileImage', function (req, res) {
    profileId = req.user.profile;

    profilePictureBL.GetUserProfileImage(profileId).then((result) => {
        res.send(result);
    }).catch((err) => {
        logger.error(err);
        res.sendStatus(500);
    });
});

// Add new profile image.
router.post('/saveImage', function (req, res) {
    let imageData = req.body;

    imageData.userId = req.user._id;

    profilePictureBL.SaveImage(imageData).then((result) => {
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
router.delete('/deleteImage', function (req, res) {
    let userId = req.user._id;
    let profileId = req.user.profile;

    profilePictureBL.DeleteImage(userId, profileId).then((result) => {
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

module.exports = router;