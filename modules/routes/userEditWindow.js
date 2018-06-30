const userEditWindowBL = require('../BL/userEditWindowBL');

module.exports = function (app) {

    prefix = "/api/userEditWindow";

    app.put(prefix + '/updateUserInfo', function (req, res) {
        var updateFields = req.body.updateFields;
        updateFields._id = req.user._id;

        userEditWindowBL.UpdateUserInfo(updateFields).then(result => {
            res.send(result);
        }).catch(err => {
            res.status(500).end();
        }); 
    });
}