const DAL = require('../../DAL');
const config = require('../../../config');

const usersReportsCollectionName = config.db.collections.usersReports;
const reportReasonsCollectionName = config.db.collections.reportReasons;
const usersCollectionName = config.db.collections.users;


module.exports = {
    GetAllReports() {
        return new Promise((resolve, reject) => {
            var joinReason = {
                $lookup:
                {
                    from: reportReasonsCollectionName,
                    localField: 'reasonId',
                    foreignField: '_id',
                    as: 'reason'
                }
            };

            var unwindReason = {
                $unwind: {
                    path: "$reason"
                }
            };

            var joinReportingUser = {
                $lookup:
                {
                    from: usersCollectionName,
                    localField: 'reportingUserId',
                    foreignField: '_id',
                    as: 'reportingUser'
                }
            };

            var unwindReportingUser = {
                $unwind: {
                    path: "$reportingUser",
                    preserveNullAndEmptyArrays: true
                }
            };

            var joinReportedUser = {
                $lookup:
                {
                    from: usersCollectionName,
                    localField: 'reportedUserId',
                    foreignField: '_id',
                    as: 'reportedUser'
                }
            };

            var unwindReportedUser = {
                $unwind: {
                    path: "$reportedUser",
                    preserveNullAndEmptyArrays: true
                }
            };

            var sort = { $sort: { "openDate": 1 } };

            var aggregateArray = [
                joinReason,
                unwindReason,
                joinReportingUser,
                unwindReportingUser,
                joinReportedUser,
                unwindReportedUser,
                sort
            ];

            DAL.Aggregate(usersReportsCollectionName, aggregateArray).then(reports => {
                reports && reports.forEach(report => {
                    delete report.reasonId;
                    report.reason = report.reason.name;

                    var reportingUser = null;
                    var reportedUser = null;

                    // Prepare reporting user object to client.
                    report.reportingUser && (reportingUser = {
                        "fullName": report.reportingUser.firstName + " " + report.reportingUser.lastName
                    });

                    // Prepare reported user object to client.
                    report.reportedUser && (reportedUser = {
                        "fullName": report.reportedUser.firstName + " " + report.reportedUser.lastName
                    });

                    report.reportingUser = reportingUser;
                    report.reportedUser = reportedUser;

                });

                resolve(reports);
            }).catch(e => {
                reject(e);
            });
        });
    }
}