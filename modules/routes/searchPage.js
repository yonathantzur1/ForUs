const searchPageBL = require('../BL/searchPageBL');
const logger = require('../../logger');

let prefix = "/api/searchPage";

module.exports = function (app) {

    app.get(prefix + '/getSearchResults', function (req, res) {
        let input = req.query.input;

        searchPageBL.GetSearchPageResults(input, req.user._id).then(result => {
            res.send(result);
        }).catch(err => {
            logger.error(err);
            res.sendStatus(500);
        });
    });

    app.get(prefix + '/getUserFriendsStatus', function (req, res) {
        searchPageBL.GetUserFriendRequests(req.user._id).then(result => {
            let friendsStatus = result.friendRequests;
            friendsStatus.friends = req.user.friends;
            res.send(friendsStatus);
        }).catch(err => {
            logger.error(err);
            res.sendStatus(500);
        });
    });
}