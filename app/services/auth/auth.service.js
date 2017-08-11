"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var basic_service_1 = require("../basic/basic.service");
var AuthService = (function (_super) {
    __extends(AuthService, _super);
    function AuthService() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.prefix = "/api/auth";
        return _this;
    }
    AuthService.prototype.IsUserOnSession = function () {
        return _super.prototype.get.call(this, this.prefix + '/isUserOnSession')
            .toPromise()
            .then(function (result) {
            return result.json();
        })
            .catch(function (result) {
            return null;
        });
    };
    AuthService.prototype.GetCurrUserName = function () {
        return _super.prototype.get.call(this, this.prefix + '/getCurrUserName')
            .toPromise()
            .then(function (result) {
            return result.json();
        })
            .catch(function (result) {
            return null;
        });
    };
    return AuthService;
}(basic_service_1.BasicService));
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map