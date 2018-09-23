const DAL = require('../DAL');
const config = require('../../config');
const enums = require('../enums');

var collectionName = config.db.collections.logs;

module.exports = {

    ResetPasswordRequest(email, ip, userAgent) {
        return this.InsertStandartLog(enums.LOG_TYPE.RESET_PASSWORD_REQUEST, email, ip, userAgent);
    },

    Login(email, ip, userAgent) {
        return this.InsertStandartLog(enums.LOG_TYPE.LOGIN, email, ip, userAgent);
    },

    LoginFail(email, ip, userAgent) {
        return this.InsertStandartLog(enums.LOG_TYPE.LOGIN_FAIL, email, ip, userAgent);
    },

    Register(email, ip, userAgent) {
        return this.InsertStandartLog(enums.LOG_TYPE.REGISTER, email, ip, userAgent);
    },

    InsertStandartLog(type, email, ip, userAgent) {
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