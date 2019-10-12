const DAL = require('../../DAL');
const config = require('../../../config');
const enums = require('../../enums');

const logsCollectionName = config.db.collections.logs;
const usersCollectionName = config.db.collections.users;
const profilePicturesCollectionName = config.db.collections.profilePictures;

module.exports = {
    getLogData(logType, range, datesRange, clientTimeZone, email) {
        return new Promise((resolve, reject) => {
            let barsNumber;
            let rangeKey;
            let groupFilter;
            let isRangeValid = true;
            let dateWithOffsetQuery = { date: "$date", timezone: getTimeZoneOffsetString(clientTimeZone) };

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
                let filter = {
                    "type": logType,
                    "date": {
                        $gte: new Date(datesRange.startDate),
                        $lte: new Date(datesRange.endDate)
                    }
                };

                email && (filter.email = email);

                let logsFilter = {
                    $match: filter
                };

                let groupObj = {
                    $group: {
                        _id: groupFilter,
                        count: { $sum: 1 }
                    }
                };

                let aggregate = [logsFilter, groupObj];

                DAL.aggregate(logsCollectionName, aggregate).then((result) => {
                    let data = [];

                    for (let i = 0; i < barsNumber; i++) {
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

    getUserByEmail(email) {
        return new Promise((resolve, reject) => {
            email = email.replace(/\\/g, '');

            let usersFilter = {
                $match: {
                    email
                }
            };

            let joinFilter = {
                $lookup: {
                    from: profilePicturesCollectionName,
                    localField: 'profile',
                    foreignField: '_id',
                    as: 'profileImage'
                }
            };

            let aggregateArray = [
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

            DAL.aggregate(usersCollectionName, aggregateArray).then((users) => {
                if (users && users.length === 1) {
                    let user = users[0];

                    resolve({
                        fullName: user.fullName,
                        profileImage: (user.profileImage && user.profileImage.length === 1) ?
                            user.profileImage[0].image : null
                    });
                }
                else {
                    resolve(null);
                }
            }).catch(reject);
        });
    }
};

function getTimeZoneOffsetString(clientTimeZone) {
    // Convert the sign to the opposite for the mongo timezone calculation.
    clientTimeZone *= -1;
    let isPositive = (clientTimeZone >= 0);

    let hours = clientTimeZone / 60;
    let minutes = clientTimeZone - (hours * 60);

    if (hours < 10) {
        hours = "0" + hours;
    }

    if (minutes < 10) {
        minutes = "0" + minutes;
    }

    let offsetString = hours + ":" + minutes;
    isPositive ? (offsetString = "+" + offsetString) : (offsetString = "-" + offsetString);

    // Convert time zone from minutes to milliseconds.
    return offsetString;
}