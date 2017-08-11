"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var basic_service_1 = require("../basic/basic.service");
"";
var LoginService = (function (_super) {
    __extends(LoginService, _super);
    function LoginService() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.prefix = "/login";
        return _this;
    }
    LoginService.prototype.Login = function (user) {
        return _super.prototype.post.call(this, this.prefix + '/login', JSON.stringify(user))
            .toPromise()
            .then(function (result) {
            return result.json();
        })
            .catch(function (result) {
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
            return result.json();
        })
            .catch(function (result) {
            return null;
        });
    };
    LoginService.prototype.Forgot = function (email) {
        var details = { "email": email };
        return _super.prototype.put.call(this, this.prefix + '/forgot', JSON.stringify(details))
            .toPromise()
            .then(function (result) {
            return result.json();
        })
            .catch(function (result) {
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
            return result.json();
        })
            .catch(function (result) {
            return null;
        });
    };
    return LoginService;
}(basic_service_1.BasicService));
exports.LoginService = LoginService;
//# sourceMappingURL=login.service.js.map