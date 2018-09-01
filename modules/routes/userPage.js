const userPageBL = require('../BL/userPageBL');
const forgotPasswordBL = require('../BL/forgotPasswordBL');
const config = require('../../config');
const mailer = require('../mailer');

module.exports = function (app) {

    prefix = "/api/userPage";

    // Get user details by id.
    app.get(prefix + '/getUserDetails', function (req, res) {
        var userId = req.query.id;
        var currUserId = req.user._id;

        userPageBL.GetUserDetails(userId, currUserId).then(result => {
            res.send(result);
        }).catch(err => {
            res.status(500).end();
        });
    });

    // Remove friend.
    app.delete(prefix + '/removeFriends', function (req, res) {
        var currUserId = req.user._id;
        var friendId = req.query.friendId;

        userPageBL.RemoveFriends(currUserId, friendId).then(result => {
            res.send(result);
        }).catch(err => {
            res.status(500).end();
        });
    });

    // Change password.
    app.get(prefix + '/changePassword', function (req, res) {
        var email = req.user.email;

        forgotPasswordBL.SetUserResetCode(email).then(result => {
            if (result) {
                var resetAddress =
                    config.addresses.site + "/forgot/" + result.resetCode.token;
                mailer.ChangePasswordMail(email,
                    result.firstName,
                    resetAddress);
                res.send(true);

                // Log - in case the user has found.
                logsBL.ResetPasswordRequest(email, general.GetIpFromRequest(req), general.GetUserAgentFromRequest(req));
            }
            else {
                // Return to the client null in case of error.
                res.send(null);
            }
        }).catch(err => {
            res.status(500).end();
        });
    });

};