const DAL = require('../DAL');
const config = require('../../config');
const requestHandler = require('../handlers/requestHandler');
const LOG_TYPE = require('../enums').LOG_TYPE;

let logsCollectionName = config.db.collections.logs;

module.exports = {
    ResetPasswordRequest(email, req) {
        InsertStandardLog(
            LOG_TYPE.RESET_PASSWORD_REQUEST,
            email,
            req
        );
    },

    Login(email, req) {
        InsertStandardLog(
            LOG_TYPE.LOGIN,
            email,
            req
        );
    },

    LoginFail(email, req) {
        InsertStandardLog(
            LOG_TYPE.LOGIN_FAIL,
            email,
            req
        );
    },

    Register(email, req) {
        InsertStandardLog(
            LOG_TYPE.REGISTER,
            email,
            req
        );
    },

    DeleteUser(email, req) {
        InsertStandardLog(
            LOG_TYPE.DELETE_USER,
            email,
            req
        );
    }
}

function InsertStandardLog(type, email, req) {
    if (!config.server.isProd) {
        return;
    }

    DAL.insert(logsCollectionName, {
        type,
        ip: requestHandler.GetIpFromRequest(req),
        userAgent: requestHandler.GetUserAgentFromRequest(req),
        email,
        date: new Date()
    });
}