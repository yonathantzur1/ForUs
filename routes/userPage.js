const userPageBL = require('../modules/BL/userPageBL');

module.exports = function (app) {

    prefix = "/api/userPage";

    // Add new profile image.
    app.get(prefix + '/getUserDetails', function (req, res) {
        var userId = req.query.id;

        userPageBL.GetUserDetails(userId).then(result => {
            res.send(result);
        }).catch(err => {
            res.status(500).end();
        });
    });

};