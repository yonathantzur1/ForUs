const DAL = require('../DAL.js');
const config = require('../config.js');
const enums = require('../enums');

const logsCollectionName = config.db.collections.logs;
const usersCollectionName = config.db.collections.users;

var self = module.exports = {
    GetLoginsData: (range, email) => {
        return new Promise((resolve, reject) => {
            var filter = {
                "type": enums.LOG_TYPE.LOGIN
            };    

            var isRangeValid = true;

            switch (range) {
                case enums.STATISTICS_RANGE.MONTHLY: {
                    break;
                }
                case enums.STATISTICS_RANGE.WEEKLY: {
                    break;
                }
                case enums.STATISTICS_RANGE.DAILY: {
                    break;
                }
                default: {
                    isRangeValid = false;
                    reject("No valid statistics range found");
                }
            }

            if (isRangeValid) {
                email && (filter.email = email);
                
                var sortObj = { "date": 1 };

                DAL.Find(logsCollectionName, filter, sortObj).then(result => {
                    resolve(result);
                }).catch(reject);
            }
        });
    }
}