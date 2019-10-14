const DAL = require('../../DAL');
const config = require('../../../config');

const errorHandler = require('../../handlers/errorHandler');

const usersReportsCollectionName = config.db.collections.usersReports;
const reportReasonsCollectionName = config.db.collections.reportReasons;
const usersCollectionName = config.db.collections.users;

module.exports = {
    async getAllReports() {
        let joinReason = {
            $lookup:
            {
                from: reportReasonsCollectionName,
                localField: 'reasonId',
                foreignField: '_id',
                as: 'reason'
            }
        };

        let unwindReason = {
            $unwind: {
                path: "$reason"
            }
        };

        let joinReportingUser = {
            $lookup:
            {
                from: usersCollectionName,
                localField: 'reportingUserId',
                foreignField: '_id',
                as: 'reportingUser'
            }
        };

        let unwindReportingUser = {
            $unwind: {
                path: "$reportingUser",
                preserveNullAndEmptyArrays: true
            }
        };

        let joinReportedUser = {
            $lookup:
            {
                from: usersCollectionName,
                localField: 'reportedUserId',
                foreignField: '_id',
                as: 'reportedUser'
            }
        };

        let unwindReportedUser = {
            $unwind: {
                path: "$reportedUser",
                preserveNullAndEmptyArrays: true
            }
        };

        let sort = { $sort: { "openDate": -1 } };

        let aggregateArray = [
            joinReason,
            unwindReason,
            joinReportingUser,
            unwindReportingUser,
            joinReportedUser,
            unwindReportedUser,
            sort
        ];

        let reports = await DAL.aggregate(usersReportsCollectionName, aggregateArray)
            .catch(errorHandler.promiseError);

        reports.forEach(report => {
            delete report.reasonId;
            report.reason = report.reason.name;

            // Build reported and reporting users objects to client.
            reportingUser = buildReportUser(report.reportingUser);
            reportedUser = buildReportUser(report.reportedUser);

            report.reportingUser = buildReportUser(report.reportingUser);
            report.reportedUser = buildReportUser(report.reportedUser);

        });

        return reports;
    }
};

function buildReportUser(user) {
    return user ? {
        "_id": user._id,
        "fullName": user.firstName + " " + user.lastName
    } : null;
}