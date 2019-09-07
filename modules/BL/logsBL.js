const DAL = require('../DAL');
const config = require('../../config');
const enums = require('../enums');
const requestHandler = require('../handlers/requestHandler');

let logsCollectionName = config.db.collections.logs;

module.exports = {
    ResetPasswordRequest(email, req) {
        return this.InsertStandardLog(
            enums.LOG_TYPE.RESET_PASSWORD_REQUEST,
            email,
            requestHandler.GetIpFromRequest(req),
            requestHandler.GetUserAgentFromRequest(req)
        );
    },

    Login(email, req) {
        return this.InsertStandardLog(
            enums.LOG_TYPE.LOGIN,
            email,
            requestHandler.GetIpFromRequest(req),
            requestHandler.GetUserAgentFromRequest(req)
        );
    },

    LoginFail(email, req) {
        return this.InsertStandardLog(
            enums.LOG_TYPE.LOGIN_FAIL,
            email,
            requestHandler.GetIpFromRequest(req),
            requestHandler.GetUserAgentFromRequest(req)
        );
    },

    Register(email, req) {
        return this.InsertStandardLog(
            enums.LOG_TYPE.REGISTER,
            email,
            requestHandler.GetIpFromRequest(req),
            requestHandler.GetUserAgentFromRequest(req)
        );
    },

    InsertStandardLog(type, email, ip, userAgent) {
        return new Promise((resolve, reject) => {
            // In case of production environment.
            if (config.server.isProd) {
                log = {
                    type,
                    ip,
                    userAgent,
                    email,
                    "date": new Date()
                };

                DAL.Insert(logsCollectionName, log).then(resolve).catch(reject);
            }
            else {
                resolve(false);
            }
        });
    }
}