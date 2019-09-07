module.exports = {
    SYSTEM_JOBS_NAMES: {
        CLEAN_DISCONNECT_USERS: "clean_disconnect_users"
    },

    PERMISSION: {
        MASTER: "master",
        ADMIN: "admin"
    },

    LOG_TYPE: {
        RESET_PASSWORD_REQUEST: "reset_password_request",
        LOGIN: "login",
        LOGIN_FAIL: "login_fail",
        REGISTER: "register"
    },

    STATISTICS_RANGE: {
        YEARLY: "yearly",
        WEEKLY: "weekly"
    },

    USER_UPDATE_INFO_ERROR: {
        EMAIL_EXISTS: "email_exists",
        WRONG_PASSWORD: "wrong_password"
    },

    SOCKET_STATE: {
        ACTIVE: "active",
        CLOSE: "close",
        LOGOUT: "logout"
    },

    REGEXP: {
        USER: {
            NAME: "^([א-ת]{1}[-'`]{0,1}[א-ת]{1,}[-'`]{0,1}[א-ת]{0,}){1,}([ ]+([א-ת]{1}[-'`]{0,1}[א-ת]{1,}[-'`]{0,1}[א-ת]{0,}){1,})*$",
            EMAIL: "^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$"
        },
        PASSWORD: {
            HASH: "^[a-z0-9]{128}$"
        }
    }
}