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

    LoginIp: function (email, ip) {
        return new Promise((resolve, reject) => {
            findQuery = { email, "type": enums.LOG_TYPE.LOGIN_IP, ip };

            DAL.FindOne(collectionName, findQuery).then(log => {
                if (log == null) {
                    log = {
                        "type": enums.LOG_TYPE.LOGIN_IP,
                        ip,
                        email,
                        "date": new Date()
                    };

                    DAL.Insert(collectionName, log).then(resolve).catch(reject);
                }
                else {
                    updateObj = {
                        $set: { "date": new Date() }
                    };

                    DAL.UpdateOne(collectionName, findQuery, updateObj).then(resolve).catch(reject);
                }
            }).catch(reject);
        });
    }
}