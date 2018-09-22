const userReportWindowBL = require('../../BL/userPage/userReportWindowBL');
const validate = require('../../security/validate');

var prefix = "/api/userReportWindow";

module.exports = function (app) {
    // Get all report reasons from DB.
    app.get(prefix + '/getAllReportReasons', (req, res) => {
        userReportWindowBL.GetAllReportReasons().then(result => {
            res.send(result);
        }).catch(err => {
            res.status(500).end();
        });
    });
}