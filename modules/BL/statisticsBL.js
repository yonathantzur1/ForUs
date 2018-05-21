const DAL = require('../DAL.js');
const config = require('../config.js');
const enums = require('../enums');

const logsCollectionName = config.db.collections.logs;
const usersCollectionName = config.db.collections.users;

var self = module.exports = {
    GetLoginsData: (logType, range, datesRange, email) => {
        return new Promise((resolve, reject) => {
            var barsNumber;
            var rangeKey;
            var groupFilter;
            var isRangeValid = true;

            switch (range) {
                case enums.STATISTICS_RANGE.YEARLY: {
                    barsNumber = 12;
                    rangeKey = "month";
                    groupFilter = { month: { $month: "$date" }, year: { $year: "$date" } };
                    break;
                }
                case enums.STATISTICS_RANGE.WEEKLY: {
                    barsNumber = 7;
                    rangeKey = "dayOfWeek";

                    var dateWithOffsetQuery;
                    var dateMillisecondsOffset = GetTimeZoneMillisecondsOffset();

                    if (dateMillisecondsOffset > 0) {
                        dateWithOffsetQuery = { $add: ["$date", dateMillisecondsOffset] };
                    }
                    else {
                        dateWithOffsetQuery = { $sub: ["$date", (-1 * dateMillisecondsOffset)] };
                    }

                    groupFilter = { dayOfWeek: { $dayOfWeek: dateWithOffsetQuery }, month: { $month: "$date" }, year: { $year: "$date" } };
                    break;
                }
                default: {
                    isRangeValid = false;
                }
            }

            if (isRangeValid) {
                var filter = {
                    "type": logType,
                    "date": {
                        $gte: new Date(datesRange.startDate),
                        $lte: new Date(datesRange.endDate)
                    }
                }

                email && (filter.email = email);

                var logsFilter = {
                    $match: filter
                }

                var groupObj = {
                    $group: {
                        _id: groupFilter,
                        count: { $sum: 1 }
                    }
                }

                var aggregate = [logsFilter, groupObj];

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

function GetTimeZoneMillisecondsOffset() {
    var timeZone = new Date().getTimezoneOffset();

    // Convert the sign to the opposite for the mongo timezone calculation.
    timeZone *= -1;

    // Convert time zone from minutes to milliseconds.
    return (timeZone * 60 * 1000);
}