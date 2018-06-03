export enum PERMISSION {
    MASTER = "master",
    ADMIN = "admin"
}

export enum LOG_TYPE {
    RESET_PASSWORD_REQUEST = "reset_password_request",
    LOGIN = "login",
    LOGIN_FAIL = "login_fail",
    BLOCK_USER_LOGIN_TRY = "block_user_login_try",
    REGISTER = "register"
}

export enum STATISTICS_RANGE {
    YEARLY = "yearly",
    WEEKLY = "weekly"
}