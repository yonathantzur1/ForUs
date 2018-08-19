"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var basic_service_1 = require("../basic/basic.service");
var AuthService = /** @class */ (function (_super) {
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
            return result;
        })
            .catch(function (e) {
            return null;
        });
    };
    AuthService.prototype.IsUserRoot = function () {
        return _super.prototype.get.call(this, this.prefix + '/isUserRoot')
            .toPromise()
            .then(function (result) {
            return result;
        })
            .catch(function (e) {
            return null;
        });
    };
    AuthService.prototype.GetCurrUser = function () {
        return _super.prototype.get.call(this, this.prefix + '/getCurrUser')
            .toPromise()
            .then(function (result) {
            return result;
        })
            .catch(function (e) {
            return null;
        });
    };
    AuthService.prototype.SetCurrUserToken = function () {
        return _super.prototype.get.call(this, this.prefix + '/setCurrUserToken')
            .toPromise()
            .then(function (result) {
            return result;
        })
            .catch(function (e) {
            return null;
        });
    };
    AuthService.prototype.IsUserSocketConnect = function () {
        return _super.prototype.get.call(this, this.prefix + '/isUserSocketConnect')
            .toPromise()
            .then(function (result) {
            return result;
        })
            .catch(function (e) {
            return null;
        });
    };
    return AuthService;
}(basic_service_1.BasicService));
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map