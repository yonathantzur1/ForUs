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
    USER_UPDATE_INFO_ERROR["EMAIL_EXISTS"] = "email_exists";
    USER_UPDATE_INFO_ERROR["WRONG_PASSWORD"] = "wrong_password";
})(USER_UPDATE_INFO_ERROR = exports.USER_UPDATE_INFO_ERROR || (exports.USER_UPDATE_INFO_ERROR = {}));
var USER_REPORT_STATUS;
(function (USER_REPORT_STATUS) {
    USER_REPORT_STATUS[USER_REPORT_STATUS["ACTIVE"] = 0] = "ACTIVE";
    USER_REPORT_STATUS[USER_REPORT_STATUS["TAKEN"] = 1] = "TAKEN";
    USER_REPORT_STATUS[USER_REPORT_STATUS["CLOSE"] = 2] = "CLOSE";
})(USER_REPORT_STATUS = exports.USER_REPORT_STATUS || (exports.USER_REPORT_STATUS = {}));
//# sourceMappingURL=enums.js.map