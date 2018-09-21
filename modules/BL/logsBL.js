const DAL = require('../DAL');
const config = require('../../config');
const enums = require('../enums');

var collectionName = config.db.collections.logs;

module.exports = {

    ResetPasswordRequest: function (email, ip, userAgent) {
        return this.InsertStandartLog(enums.LOG_TYPE.RESET_PASSWORD_REQUEST, email, ip, userAgent);
    },

    Login: function (email, ip, userAgent) {
        return this.InsertStandartLog(enums.LOG_TYPE.LOGIN, email, ip, userAgent);
    },

    LoginFail: function (email, ip, userAgent) {
        return this.InsertStandartLog(enums.LOG_TYPE.LOGIN_FAIL, email, ip, userAgent);
    },

    Register: function (email, ip, userAgent) {
        return this.InsertStandartLog(enums.LOG_TYPE.REGISTER, email, ip, userAgent);
    },

    InsertStandartLog: function (type, email, ip, userAgent) {
        // In case of production environment.
        if (config.server.isProd) {
            return new Promise((resolve, reject) => {
                log = {
                    type,
                    ip,
                    userAgent,
                    email,
                    "date": new Date()
                };

                DAL.Insert(collectionName, log).then(resolve).catch(reject);
            });
        }
    }
}