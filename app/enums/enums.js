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
    LOG_TYPE["REGISTER"] = "register";
})(LOG_TYPE = exports.LOG_TYPE || (exports.LOG_TYPE = {}));
var STATISTICS_RANGE;
(function (STATISTICS_RANGE) {
    STATISTICS_RANGE["YEARLY"] = "yearly";
    STATISTICS_RANGE["WEEKLY"] = "weekly";
})(STATISTICS_RANGE = exports.STATISTICS_RANGE || (exports.STATISTICS_RANGE = {}));
var USER_UPDATE_INFO_ERROR;
(function (USER_UPDATE_INFO_ERROR) {
    USER_UPDATE_INFO_ERROR["EMAIL_EXISTS"] = "-1";
    USER_UPDATE_INFO_ERROR["WRONG_PASSWORD"] = "-2";
})(USER_UPDATE_INFO_ERROR = exports.USER_UPDATE_INFO_ERROR || (exports.USER_UPDATE_INFO_ERROR = {}));
//# sourceMappingURL=enums.js.map