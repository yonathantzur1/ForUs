export enum PERMISSION {
    MASTER = "master",
    ADMIN = "admin"
}

export enum LOG_TYPE {
    RESET_PASSWORD_REQUEST = "reset_password_request",
    LOGIN = "login",
    LOGIN_FAIL = "login_fail",
    REGISTER = "register"
}

export enum STATISTICS_RANGE {
    YEARLY = "yearly",
    WEEKLY = "weekly"
}

export enum USER_UPDATE_INFO_ERROR {
    EMAIL_EXISTS = "-1",
    WRONG_PASSWORD = "-2"
}