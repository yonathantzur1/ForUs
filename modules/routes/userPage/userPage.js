const userPageBL = require('../../BL/userPage/userPageBL');
const logger = require('../../../logger');

let prefix = "/api/userPage";

module.exports = function (app) {
    // Get user details by id.
    app.get(prefix + '/getUserDetails', function (req, res) {
        let userId = req.query.id;
        let currUserId = req.user._id;

        userPageBL.GetUserDetails(userId, currUserId).then(result => {
            res.send(result);
        }).catch(err => {
            logger.error(err);
            res.sendStatus(500);
        });
    });

    // Remove friend.
    app.delete(prefix + '/removeFriends', function (req, res) {
        let currUserId = req.user._id;
        let friendId = req.query.friendId;

        userPageBL.RemoveFriends(currUserId, friendId).then(result => {
            res.send(result);
        }).catch(err => {
            logger.error(err);
            res.sendStatus(500);
        });
    });

    app.put(prefix + '/deleteUserValidation', function (req, res) {
        userPageBL.DeleteUserValidation(req.user._id).then(result => {
            res.send(result);
        }).catch((err) => {
            logger.error(err);
            res.sendStatus(500);
        });
    });

};