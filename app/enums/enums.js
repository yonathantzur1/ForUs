"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PERMISSION;
(function (PERMISSION) {
    PERMISSION["MASTER"] = "master";
    PERMISSION["ADMIN"] = "admin";
})(PERMISSION = exports.PERMISSION || (exports.PERMISSION = {}));
var LOG_TYPE;
(function (LOG_TYPE) {
    LOG_TYPE["RESET_PASSWORD_REQUEST"] = "reset_password_request";
    LOG_TYPE["LOGIN"] = "login";
    LOG_TYPE["LOGIN_FAIL"] = "login_fail";
    LOG_TYPE["BLOCK_USER_LOGIN_TRY"] = "block_user_login_try";
    LOG_TYPE["REGISTER"] = "register";
})(LOG_TYPE = exports.LOG_TYPE || (exports.LOG_TYPE = {}));
var STATISTICS_RANGE;
(function (STATISTICS_RANGE) {
    STATISTICS_RANGE["YEARLY"] = "yearly";
    STATISTICS_RANGE["WEEKLY"] = "weekly";
})(STATISTICS_RANGE = exports.STATISTICS_RANGE || (exports.STATISTICS_RANGE = {}));
//# sourceMappingURL=enums.js.map