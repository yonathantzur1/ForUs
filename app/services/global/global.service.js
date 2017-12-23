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
require("rxjs/add/operator/share");
require("rxjs/add/operator/startWith");
var BehaviorSubject_1 = require("rxjs/BehaviorSubject");
var login_service_1 = require("../login/login.service");
var Permissions;
(function (Permissions) {
    Permissions["ADMIN"] = "admin";
})(Permissions = exports.Permissions || (exports.Permissions = {}));
var GlobalService = /** @class */ (function (_super) {
    __extends(GlobalService, _super);
    function GlobalService() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        // Use this property for property binding
        _this.data = new BehaviorSubject_1.BehaviorSubject({});
        _this.userPermissions = [];
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
    GlobalService.prototype.ResetGlobalVariables = function () {
        this.socket && this.socket.destroy();
        this.socket = null;
        this.data = new BehaviorSubject_1.BehaviorSubject({});
        this.userProfileImage = null;
        this.userPermissions = [];
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