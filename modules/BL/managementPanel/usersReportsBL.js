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
                    path: "$reportingUser"
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
                    path: "$reportedUser"
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

                    // Prepare reporting user object to client.
                    var reportingUser = {
                        "_id":  report.reportingUser._id,
                        "fullName": report.reportingUser.firstName + " " + report.reportingUser.lastName
                    }

                    delete report.reportingUserId;
                    report.reportingUser = reportingUser;

                    // Prepare reported user object to client.
                    var reportedUser = {
                        "_id":  report.reportedUser._id,
                        "fullName": report.reportedUser.firstName + " " + report.reportedUser.lastName
                    }
                    
                    delete report.reportedUserId;
                    report.reportedUser = reportedUser;

                });

                resolve(reports);
            }).catch(e => {
                reject(e);
            });
        });
    }
}