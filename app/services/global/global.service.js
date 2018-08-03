"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var rxjs_1 = require("rxjs");
var login_service_1 = require("../login/login.service");
var empty_profile_1 = require("../../pictures/empty-profile");
var enums_1 = require("../../enums/enums");
var GlobalService = /** @class */ (function (_super) {
    __extends(GlobalService, _super);
    function GlobalService() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        // Use this property for property binding
        _this.data = new rxjs_1.BehaviorSubject({});
        _this.socketOnDictionary = {};
        _this.userPermissions = [];
        _this.defaultProfileImage = empty_profile_1.EmptyProfile;
        _this.uidCookieName = "uid";
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
    GlobalService.prototype.IsUserHasMasterPermission = function () {
        return (this.userPermissions.indexOf(enums_1.PERMISSION.MASTER) != -1);
    };
    GlobalService.prototype.IsUserHasRootPermission = function () {
        return ((this.userPermissions.indexOf(enums_1.PERMISSION.MASTER) != -1) ||
            (this.userPermissions.indexOf(enums_1.PERMISSION.ADMIN) != -1));
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
        deleteCookieByName(this.uidCookieName);
        this.DeleteTokenFromCookie().then(function (result) { });
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
    return GlobalService;
}(login_service_1.LoginService));
exports.GlobalService = GlobalService;
//# sourceMappingURL=global.service.js.map