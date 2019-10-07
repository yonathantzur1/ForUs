exports.SYSTEM_JOBS_NAMES = Object.freeze({
    CLEAN_DISCONNECT_USERS: "CLEAN_DISCONNECT_USERS"
});

exports.PERMISSION = Object.freeze({
    MASTER: "MASTER",
    ADMIN: "ADMIN"
});

exports.LOG_TYPE = Object.freeze({
    RESET_PASSWORD_REQUEST: "RESET_PASSWORD_REQUEST",
    LOGIN: "LOGIN",
    LOGIN_FAIL: "LOGIN_FAIL",
    REGISTER: "REGISTER",
    DELETE_USER: "DELETE_USER"
});

exports.STATISTICS_RANGE = Object.freeze({
    YEARLY: "YEARLY",
    WEEKLY: "WEEKLY"
});

exports.USER_UPDATE_INFO_ERROR = Object.freeze({
    EMAIL_EXISTS: "EMAIL_EXISTS",
    WRONG_PASSWORD: "WRONG_PASSWORD"
});

exports.SOCKET_STATE = Object.freeze({
    ACTIVE: "ACTIVE",
    CLOSE: "CLOSE",
    LOGOUT: "LOGOUT"
});

exports.REGEXP = Object.freeze({
    USER: {
        NAME: "^([א-ת]{1}[-'`]{0,1}[א-ת]{1,}[-'`]{0,1}[א-ת]{0,}){1,}([ ]+([א-ת]{1}[-'`]{0,1}[א-ת]{1,}[-'`]{0,1}[א-ת]{0,}){1,})*$",
        EMAIL: "^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$"
    },
    PASSWORD: {
        HASH: "^[a-z0-9]{128}$"
    }
});