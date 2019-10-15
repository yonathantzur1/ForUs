const DAL = require('../DAL');
const config = require('../../config');
const requestHandler = require('../handlers/requestHandler');
const LOG_TYPE = require('../enums').LOG_TYPE;

let logsCollectionName = config.db.collections.logs;

module.exports = {
    resetPasswordRequest(email, req) {
        insertLog(
            LOG_TYPE.RESET_PASSWORD_REQUEST,
            email,
            req
        );
    },

    login(email, req) {
        insertLog(
            LOG_TYPE.LOGIN,
            email,
            req
        );
    },

    loginFail(email, req) {
        insertLog(
            LOG_TYPE.LOGIN_FAIL,
            email,
            req
        );
    },

    register(email, req) {
        insertLog(
            LOG_TYPE.REGISTER,
            email,
            req
        );
    },

    deleteUser(email, req) {
        insertLog(
            LOG_TYPE.DELETE_USER,
            email,
            req
        );
    }
};

function insertLog(type, email, req) {
    if (!config.server.isProd) {
        return;
    }

    DAL.insert(logsCollectionName, {
        type,
        ip: requestHandler.getIpFromRequest(req),
        userAgent: requestHandler.getUserAgentFromRequest(req),
        email,
        date: new Date()
    }).catch(() => {
        return;
    });
}