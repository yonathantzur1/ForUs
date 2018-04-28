const DAL = require('../DAL');
const config = require('../config');
const enums = require('../enums');

var collectionName = config.db.collections.logs;

module.exports = {

    ResetPasswordRequest: function (email, ip) {
        return new Promise((resolve, reject) => {
            var log = {
                "type": enums.LOG_TYPE.RESET_PASSWORD_REQUEST,
                ip,
                email,
                "date": new Date()
            };

            DAL.Insert(collectionName, log).then(resolve).catch(reject);
        });
    },

    Login: function (email, ip) {
        return new Promise((resolve, reject) => {
            findQuery = { email, "type": enums.LOG_TYPE.LOGIN, ip };

            DAL.FindOne(collectionName, findQuery).then(log => {
                if (log == null) {
                    log = {
                        "type": enums.LOG_TYPE.LOGIN,
                        ip,
                        email,
                        "lastLoginTime": new Date()
                    };

                    DAL.Insert(collectionName, log).then(resolve).catch(reject);
                }
                else {
                    updateObj = {
                        $set: { "lastLoginTime": new Date() }
                    };

                    DAL.UpdateOne(collectionName, findQuery, updateObj).then(resolve).catch(reject);
                }
            }).catch(reject);
        });
    },

    LoginFail: function (email, ip) {
        return new Promise((resolve, reject) => {
            findQuery = { email, "type": enums.LOG_TYPE.LOGIN_FAIL, ip };

            DAL.FindOne(collectionName, findQuery).then(log => {
                if (log == null) {
                    log = {
                        "type": enums.LOG_TYPE.LOGIN_FAIL,
                        ip,
                        email,
                        "dates": [new Date()]
                    };

                    DAL.Insert(collectionName, log).then(resolve).catch(reject);
                }
                else {
                    updateObj = {
                        $push: { "dates": new Date() }
                    };

                    DAL.UpdateOne(collectionName, findQuery, updateObj).then(resolve).catch(reject);
                }
            }).catch(reject);
        });
    }
}