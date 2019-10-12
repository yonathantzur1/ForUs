const DAL = require('../../DAL');
const config = require('../../../config');

const usersReportsCollectionName = config.db.collections.usersReports;
const reportReasonsCollectionName = config.db.collections.reportReasons;
const usersCollectionName = config.db.collections.users;

module.exports = {
    getAllReports() {
        return new Promise((resolve, reject) => {
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

            DAL.aggregate(usersReportsCollectionName, aggregateArray).then(reports => {
                reports && reports.forEach(report => {
                    delete report.reasonId;
                    report.reason = report.reason.name;

                    let reportingUser;
                    let reportedUser;

                    // Prepare reporting user object to client.
                    report.reportingUser && (reportingUser = {
                        "_id": report.reportingUser._id,
                        "fullName": report.reportingUser.firstName + " " + report.reportingUser.lastName
                    });

                    // Prepare reported user object to client.
                    report.reportedUser && (reportedUser = {
                        "_id": report.reportedUser._id,
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
};