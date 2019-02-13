const userReportWindowBL = require('../../BL/userPage/userReportWindowBL');
const validate = require('../../security/validate');

let prefix = "/api/userReportWindow";

module.exports = function (app) {
    // Get all report reasons from DB.
    app.get(prefix + '/getAllReportReasons', (req, res) => {
        userReportWindowBL.GetAllReportReasons().then(result => {
            res.send(result);
        }).catch(err => {
            res.status(500).end();
        });
    });

    app.post(prefix + '/reportUser',
        validate,
        (req, res) => {
            userReportWindowBL.ReportUser(req.user._id, req.user.friends, req.body).then(result => {
                res.send(result);
            }).catch(err => {
                res.status(500).end();
            });
        });
}