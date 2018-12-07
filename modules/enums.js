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

    LOCATION_ERROR: {
        PERMISSION_DENIED: 0,
        POSITION_UNAVAILABLE: 1,
        TIMEOUT: 2,
        BROWSER_NOT_SUPPORT: 3,
        UNKNOWN_ERROR: 4
    }
}