const DAL = require('../../DAL');
const config = require('../../../config');

const errorHandler = require('../../handlers/errorHandler');

const ReportReasonsCollectionName = config.db.collections.reportReasons;
const UsersReportsCollectionName = config.db.collections.usersReports;

module.exports = {
    getAllReportReasons() {
        return DAL.find(ReportReasonsCollectionName, {});
    },

    async reportUser(reportingUserId, reportingUserFriends, data) {
        let reportedUserId = data.reportedUserId;

        // In case the reporting user is not friend of the reported user.
        if (reportingUserFriends.indexOf(reportedUserId) == -1) {
            return null;
        }

        let reportObj = {
            "reportingUserId": DAL.getObjectId(reportingUserId),
            "reportedUserId": DAL.getObjectId(reportedUserId),
            "reasonId": DAL.getObjectId(data.reasonId),
            "details": data.reasonDetails,
            "handledManagerId": null,
            "openDate": new Date(),
            "closeDate": null
        };

        let insertResult = await DAL.insert(UsersReportsCollectionName, reportObj)
            .catch(errorHandler.promiseError);

        return !!insertResult;
    }
};