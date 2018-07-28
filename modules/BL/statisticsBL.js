const DAL = require('../DAL.js');
const config = require('../../config.js');
const enums = require('../enums');

const logsCollectionName = config.db.collections.logs;
const usersCollectionName = config.db.collections.users;
const profilesCollectionName = config.db.collections.profiles;

var self = module.exports = {
    GetLoginsData: (logType, range, datesRange, email) => {
        return new Promise((resolve, reject) => {
            var barsNumber;
            var rangeKey;
            var groupFilter;
            var isRangeValid = true;

            var dateMillisecondsOffset = GetTimeZoneMillisecondsOffset();
            var dateWithOffsetQuery = { $add: ["$date", dateMillisecondsOffset] };

            switch (range) {
                case enums.STATISTICS_RANGE.YEARLY: {
                    barsNumber = 12;
                    rangeKey = "month";
                    groupFilter = { month: { $month: dateWithOffsetQuery }, year: { $year: dateWithOffsetQuery } };
                    break;
                }
                case enums.STATISTICS_RANGE.WEEKLY: {
                    barsNumber = 7;
                    rangeKey = "dayOfWeek";
                    groupFilter = { dayOfWeek: { $dayOfWeek: dateWithOffsetQuery }, month: { $month: dateWithOffsetQuery }, year: { $year: dateWithOffsetQuery } };
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
    },

    GetUserByEmail: (email) => {
        return new Promise((resolve, reject) => {
            email = email.replace(/\\/g, '');

            var usersFilter = {
                $match: {
                    email
                }
            };

            var joinFilter = {
                $lookup: {
                    from: profilesCollectionName,
                    localField: 'profile',
                    foreignField: '_id',
                    as: 'profileImage'
                }
            }

            var aggregateArray = [
                {
                    $project: {
                        fullName: { $concat: ["$firstName", " ", "$lastName"] },
                        "profile": 1,
                        "email": 1
                    }
                },
                usersFilter,
                joinFilter,
                {
                    $project: {
                        // Should be here and on $project above because how aggregate works.
                        "fullName": 1,
                        "profileImage.image": 1, // Taking only specific field from profile object.
                    }
                }
            ];

            DAL.Aggregate(usersCollectionName, aggregateArray).then((users) => {
                if (users && users.length == 1) {
                    var user = users[0];

                    resolve({
                        fullName: user.fullName,
                        profileImage: (user.profileImage && user.profileImage.length == 1) ?
                            user.profileImage[0].image : null
                    });
                }
                else {
                    resolve(null);
                }
            }).catch(reject);
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