const DAL = require('../DAL.js');
const config = require('../config.js');
const enums = require('../enums');

const logsCollectionName = config.db.collections.logs;
const usersCollectionName = config.db.collections.users;

var self = module.exports = {
    GetLoginsData: (logType, range, email) => {
        return new Promise((resolve, reject) => {
            var barsNumber;
            var rangeKey;
            var isRangeValid = true;

            switch (range) {
                case enums.STATISTICS_RANGE.YEARLY: {
                    barsNumber = 12;
                    rangeKey = "month";
                    break;
                }
                case enums.STATISTICS_RANGE.WEEKLY: {
                    barsNumber = 7;
                    rangeKey = "day";
                    break;
                }
                default: {
                    isRangeValid = false;
                }
            }

            if (isRangeValid) {
                var filter = {
                    "type": logType
                }

                email && (filter.email = email);

                var logsFilter = {
                    $match: filter
                }

                var groupObj = {
                    $group: {
                        _id: { month: { $month: "$date" }, year: { $year: "$date" } },
                        count: { $sum: 1 }
                    }
                }

                var yearFilter = {
                    $match: {
                        "_id.year": new Date().getFullYear()
                    }
                }

                var sortObj = { $sort: { "_id.month": 1 } };

                var aggregate = [logsFilter, groupObj, yearFilter, sortObj];

                DAL.Aggregate(logsCollectionName, aggregate).then((result) => {
                    var data = [];

                    for (var i = 0; i < barsNumber; i++) {
                        data.push(null);
                    }

                    result.forEach(logGroup => {
                        data[logGroup._id[rangeKey] - 1] = logGroup.count;
                    });

                    resolve(data);
                }).catch(reject);
            }
            else {
                reject("Range " + range + " is not valid");
            }
        });
    }
}