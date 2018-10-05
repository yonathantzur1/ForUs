const searchPageBL = require('../BL/searchPageBL');

var prefix = "/api/searchPage";

module.exports = function (app) {

    app.get(prefix + '/getSearchResults', function (req, res) {
        var input = req.query.input;

        searchPageBL.GetSearchPageResults(input).then(result => {
            res.send(result);
        }).catch(err => {
            res.status(500).end();
        });
    });

    app.get(prefix + '/getUserFriendsStatus', function (req, res) {
        searchPageBL.GetUserFriendRequests(req.user._id).then(result => {
            var friendsStatus = result.friendRequests;
            friendsStatus.friends = req.user.friends;
            res.send(friendsStatus);
        }).catch(err => {
            res.status(500).end();
        });        
    });
}