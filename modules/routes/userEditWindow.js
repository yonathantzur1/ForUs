const userEditWindowBL = require('../BL/userEditWindowBL');
const validate = require('../security/validate');

module.exports = function (app) {

    prefix = "/api/userEditWindow";

    app.put(prefix + '/updateUserInfo',
        validate,
        (req, res) => {
            var updateFields = req.body.updateFields;
            updateFields._id = req.user._id;

            userEditWindowBL.UpdateUserInfo(updateFields).then(result => {
                res.send(result);
            }).catch(err => {
                res.status(500).end();
            });
        });
}