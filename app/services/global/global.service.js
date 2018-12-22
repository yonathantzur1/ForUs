"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var rxjs_1 = require("rxjs");
var http_1 = require("@angular/common/http");
var cookie_service_1 = require("../cookie/cookie.service");
var login_service_1 = require("../login/login.service");
var empty_profile_1 = require("../../pictures/empty-profile");
var enums_1 = require("../../enums/enums");
var GlobalService = /** @class */ (function (_super) {
    __extends(GlobalService, _super);
    function GlobalService(http, cookieService) {
        var _this = _super.call(this, http) || this;
        _this.http = http;
        _this.cookieService = cookieService;
        // Close modal when click back on browser.
        $(window).on('popstate', function () {
            var modalObj = $(".modal");
            if (modalObj.length > 0) {
                modalObj.modal("hide");
            }
        });
        // Add jQuery function to find if element has scroll bar.
        (function ($) {
            $.fn.hasScrollBar = function () {
                return this.get(0).scrollHeight > this.get(0).clientHeight;
            };
        })(jQuery);
        // Initialize variables.
        _this.data = new rxjs_1.BehaviorSubject({});
        _this.userPermissions = [];
        _this.socketOnDictionary = {};
        _this.defaultProfileImage = empty_profile_1.EmptyProfile;
        _this.uidCookieName = "uid";
        _this.isTouchDevice = (('ontouchstart' in window || navigator.maxTouchPoints) ? true : false);
        // Global variables and functions
        var globalObject = _this.globalObject = {
            days: ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"],
            months: ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"],
            shortMonths: ["ינו'", "פבר'", "מרץ", "אפר'", "מאי", "יונ'", "יול'", "אוג'", "ספט'", "אוק'", "נוב'", "דצמ'"],
            GetDateDetailsString: function (localDate, currDate, isShortMonths) {
                currDate.setHours(23, 59, 59, 999);
                var timeDiff = Math.abs(currDate.getTime() - localDate.getTime());
                var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
                var datesDaysDiff = Math.abs(currDate.getDay() - localDate.getDay());
                var dateDetailsString = "";
                if (diffDays <= 7) {
                    if (diffDays <= 2) {
                        if (currDate.getDate() == localDate.getDate()) {
                            dateDetailsString = "היום";
                        }
                        else if (Math.min((7 - datesDaysDiff), datesDaysDiff) <= 1) {
                            dateDetailsString = "אתמול";
                        }
                        else {
                            dateDetailsString = globalObject.days[localDate.getDay()];
                        }
                    }
                    else {
                        dateDetailsString = globalObject.days[localDate.getDay()];
                    }
                }
                else {
                    // In case of the same year or different years but for the first half of year.
                    if (localDate.getFullYear() == currDate.getFullYear() || diffDays < (365 / 2)) {
                        var monthString = isShortMonths ? globalObject.shortMonths[localDate.getMonth()] : globalObject.months[localDate.getMonth()];
                        dateDetailsString = (localDate.getDate()) + " ב" + monthString;
                    }
                    else {
                        dateDetailsString = (localDate.getDate()) + "/" + (localDate.getMonth() + 1) + "/" + localDate.getFullYear();
                    }
                }
                return dateDetailsString;
            }
        };
        return _this;
    }
    GlobalService.prototype.Initialize = function () {
        if (!this.socket) {
            this.socket = io();
            _super.prototype.UpdateLastLogin.call(this);
            var self = this;
            _super.prototype.GetUserPermissions.call(this).then(function (result) {
                result && (self.userPermissions = result);
            });
        }
    };
    GlobalService.prototype.IsUserHasAdminPermission = function () {
        return (this.userPermissions.indexOf(enums_1.PERMISSION.ADMIN) != -1);
    };
    GlobalService.prototype.IsUserHasMasterPermission = function () {
        return (this.userPermissions.indexOf(enums_1.PERMISSION.MASTER) != -1);
    };
    GlobalService.prototype.IsUserHasRootPermission = function () {
        return (this.IsUserHasAdminPermission() || this.IsUserHasMasterPermission());
    };
    // Emit socket event before initialize the socket object.
    GlobalService.prototype.CallSocketFunction = function (funcName, params) {
        if (!this.socket) {
            eval("io().emit('" + funcName + "'," + this.GetParamsArrayAsString(params) + ");");
        }
        else {
            eval("this.socket.emit('" + funcName + "'," + this.GetParamsArrayAsString(params) + ");");
        }
    };
    GlobalService.prototype.GetParamsArrayAsString = function (params) {
        var paramsString = "";
        if (!params || params.length == 0) {
            return null;
        }
        else {
            params.forEach(function (param) {
                if (typeof (param) == "object") {
                    paramsString += JSON.stringify(param);
                }
                else if (typeof (param) == "string") {
                    paramsString += '"' + param + '"';
                }
                else {
                    paramsString += param.toString();
                }
                paramsString += ",";
            });
            return paramsString.substring(0, paramsString.length - 1);
        }
    };
    GlobalService.prototype.ResetGlobalVariables = function () {
        this.socket && this.socket.destroy();
        this.socket = null;
        this.data = new rxjs_1.BehaviorSubject({});
        this.userProfileImage = null;
        this.userPermissions = [];
    };
    // This function should be called in order to refresh
    // the client cookies (token) that the socket object contains.
    GlobalService.prototype.RefreshSocket = function () {
        if (this.socket) {
            this.socket.disconnect();
            this.socket.connect();
            this.socket.emit('login');
        }
    };
    GlobalService.prototype.SocketOn = function (name, func) {
        this.socketOnDictionary[name] = func;
        this.socket.on(name, func);
    };
    GlobalService.prototype.Logout = function () {
        this.cookieService.DeleteCookieByName(this.uidCookieName);
        this.DeleteTokenFromCookie();
        this.ResetGlobalVariables();
    };
    GlobalService.prototype.setData = function (key, value) {
        var currData = this.data.value;
        currData = {};
        currData[key] = value;
        this.data.next(currData);
    };
    GlobalService.prototype.setMultiData = function (array) {
        var currData = this.data.value;
        currData = {};
        array.forEach(function (element) {
            currData[element.key] = element.value;
        });
        this.data.next(currData);
    };
    GlobalService = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [http_1.HttpClient,
            cookie_service_1.CookieService])
    ], GlobalService);
    return GlobalService;
}(login_service_1.LoginService));
exports.GlobalService = GlobalService;
//# sourceMappingURL=global.service.js.map