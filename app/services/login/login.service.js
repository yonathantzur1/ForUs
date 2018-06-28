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
var basic_service_1 = require("../basic/basic.service");
var LoginService = /** @class */ (function (_super) {
    __extends(LoginService, _super);
    function LoginService() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.prefix = "/login";
        return _this;
    }
    LoginService.prototype.Login = function (user) {
        return _super.prototype.post.call(this, this.prefix + '/userLogin', JSON.stringify(user))
            .toPromise()
            .then(function (result) {
            return result;
        })
            .catch(function (e) {
            return null;
        });
    };
    LoginService.prototype.UpdateLastLogin = function () {
        _super.prototype.post.call(this, this.prefix + '/updateLastLogin', null).toPromise();
    };
    LoginService.prototype.GetUserPermissions = function () {
        return _super.prototype.get.call(this, this.prefix + '/getUserPermissions')
            .toPromise()
            .then(function (result) {
            return result;
        })
            .catch(function (e) {
            return null;
        });
    };
    LoginService.prototype.Register = function (newUser) {
        var details = {
            "firstName": newUser.firstName,
            "lastName": newUser.lastName,
            "email": newUser.email,
            "password": newUser.password
        };
        return _super.prototype.post.call(this, this.prefix + '/register', JSON.stringify(details))
            .toPromise()
            .then(function (result) {
            return result;
        })
            .catch(function (e) {
            return null;
        });
    };
    LoginService.prototype.Forgot = function (email) {
        var details = { "email": email };
        return _super.prototype.put.call(this, this.prefix + '/forgot', JSON.stringify(details))
            .toPromise()
            .then(function (result) {
            return result;
        })
            .catch(function (e) {
            return null;
        });
    };
    LoginService.prototype.ResetPassword = function (forgotUser) {
        var details = {
            "email": forgotUser.email,
            "code": forgotUser.code,
            "newPassword": forgotUser.newPassword
        };
        return _super.prototype.put.call(this, this.prefix + '/resetPassword', JSON.stringify(details))
            .toPromise()
            .then(function (result) {
            return result;
        })
            .catch(function (e) {
            return null;
        });
    };
    LoginService.prototype.DeleteTokenFromCookie = function () {
        return _super.prototype.delete.call(this, this.prefix + '/deleteToken')
            .toPromise()
            .then(function () {
            return true;
        })
            .catch(function () {
            return null;
        });
    };
    return LoginService;
}(basic_service_1.BasicService));
exports.LoginService = LoginService;
//# sourceMappingURL=login.service.js.map