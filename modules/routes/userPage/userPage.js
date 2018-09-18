const userPageBL = require('../../BL/userPage/userPageBL');
const forgotPasswordBL = require('../../BL/login/forgotPasswordBL');
const managementBL = require('../../BL/managementPanel/managementBL');
const config = require('../../../config');
const mailer = require('../../mailer');
const requestHandler = require('../../handlers/requestHandler')

var prefix = "/api/userPage";

module.exports = function (app) {
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
                logsBL.ResetPasswordRequest(email,
                    requestHandler.GetIpFromRequest(req),
                    requestHandler.GetUserAgentFromRequest(req));
            }
            else {
                // Return to the client null in case of error.
                res.send(null);
            }
        }).catch(err => {
            res.status(500).end();
        });
    });

    app.delete(prefix + '/deleteUser', function (req, res) {
        managementBL.DeleteUser(req.user._id).then((result) => {            
            res.send(result);
        }).catch((err) => {
            res.status(500).end();
        });
    });

};