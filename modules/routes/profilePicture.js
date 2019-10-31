const router = require('express').Router();
const profilePictureBL = require('../BL/profilePictureBL');
const tokenHandler = require("../handlers/tokenHandler");
const errorHandler = require('../handlers/errorHandler');

// Get user profile image.
router.get('/getUserProfileImage', (req, res) => {
    let profileId = req.user.profile;

    if (!profileId) {
        return res.send(null);
    }

    profilePictureBL.getUserProfileImage(profileId).then(result => {
        res.send(result);
    }).catch(err => {
        errorHandler.routeError(err, res);
    });
});

// Add new profile image.
router.post('/saveImage', (req, res) => {
    let imageData = req.body;

    imageData.userId = req.user._id;

    profilePictureBL.saveImage(imageData).then(updatedUser => {
        if (updatedUser) {
            req.user.profile = updatedUser.profile.toString();
            let token = tokenHandler.getTokenFromUserObject(req.user);
            tokenHandler.setTokenOnCookie(token, res);
            res.send(true);
        }
        else {
            res.send(updatedUser);
        }
    }).catch(err => {
        errorHandler.routeError(err, res);
    });
});

// Delete the user profile image.
router.delete('/deleteImage', (req, res) => {
    let userId = req.user._id;
    let profileId = req.user.profile;

    profilePictureBL.deleteImage(userId, profileId).then(result => {
        if (result) {
            delete req.user.profile;
            let token = tokenHandler.getTokenFromUserObject(req.user);
            tokenHandler.setTokenOnCookie(token, res);
            res.send(true);
        }
        else {
            res.send(result);
        }
    }).catch(err => {
        errorHandler.routeError(err, res);
    });
});

module.exports = router;