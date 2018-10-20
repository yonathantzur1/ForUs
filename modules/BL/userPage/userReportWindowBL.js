const DAL = require('../../DAL');
const config = require('../../../config');

const ReportReasonsCollectionName = config.db.collections.reportReasons;
const UsersReportsCollectionName = config.db.collections.usersReports;

module.exports = {
    GetAllReportReasons() {
        return new Promise((resolve, reject) => {
            DAL.Find(ReportReasonsCollectionName, {}).then(resolve).catch(reject);
        });
    },

    ReportUser(reportingUserId, reportingUserFriends, data) {
        return new Promise((resolve, reject) => {
            var reportedUserId = data.reportedUserId;

            // In case the reporting user is not friend of the reported user.
            if (reportingUserFriends.indexOf(reportedUserId) == -1) {
                resolve(null);
            }
            else {
                var reportObj = {
                    "reportingUserId": DAL.GetObjectId(reportingUserId),
                    "reportedUserId": DAL.GetObjectId(reportedUserId),
                    "reasonId": DAL.GetObjectId(data.reasonId),
                    "details": data.reasonDetails,
                    "handledManagerId": null,
                    "openDate": new Date(),
                    "closeDate": null
                }

                DAL.Insert(UsersReportsCollectionName, reportObj).then(result => {
                    result && (result = true);
                    resolve(result);
                }).catch(reject);
            }
        });
    }
}