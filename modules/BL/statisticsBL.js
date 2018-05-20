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
                    rangeKey = "day";
                    groupFilter = { day: { $dayOfWeek: { date: "$date", timezone: GetTimeZoneStringForQuery() } }, month: { $month: "$date" }, year: { $year: "$date" } };
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

                var sortObj = { $sort: { "_id.month": 1 } };

                var aggregate = [logsFilter, groupObj, sortObj];

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

function GetTimeZoneStringForQuery() {
    var stringTimeZone = "";
    var timeZone = new Date().getTimezoneOffset();

    // Convert the sign to the opposite for the mongo timezone calculation.
    if (timeZone < 0) {
        stringTimeZone += "+";
    }
    else {
        stringTimeZone += "-";
    }

    timeZone = Math.abs(timeZone);

    var hours = Math.floor(timeZone / 60);
    var minutes = timeZone - (hours * 60);

    if (hours < 10) {
        hours = "0" + hours;
    }

    if (minutes < 10) {
        minutes = "0" + minutes;
    }

    stringTimeZone += hours + ":" + minutes;

    return stringTimeZone;
}