const DAL = require('../../DAL');
const config = require('../../../config');

const ReportReasonsCollectionName = config.db.collections.reportReasons;
const UsersReportsCollectionName = config.db.collections.usersReports;

module.exports = {
    getAllReportReasons() {
        return DAL.find(ReportReasonsCollectionName, {});
    },

    reportUser(reportingUserId, reportingUserFriends, data) {
        return new Promise((resolve, reject) => {
            let reportedUserId = data.reportedUserId;

            // In case the reporting user is not friend of the reported user.
            if (reportingUserFriends.indexOf(reportedUserId) === -1) {
                resolve(null);
            }
            else {
                let reportObj = {
                    "reportingUserId": DAL.getObjectId(reportingUserId),
                    "reportedUserId": DAL.getObjectId(reportedUserId),
                    "reasonId": DAL.getObjectId(data.reasonId),
                    "details": data.reasonDetails,
                    "handledManagerId": null,
                    "openDate": new Date(),
                    "closeDate": null
                };

                DAL.insert(UsersReportsCollectionName, reportObj).then(insertResult => {
                    resolve(!!insertResult);
                }).catch(reject);
            }
        });
    }
};