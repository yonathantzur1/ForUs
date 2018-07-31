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
var basic_service_1 = require("../../basic/basic.service");
var ForgotPasswordService = /** @class */ (function (_super) {
    __extends(ForgotPasswordService, _super);
    function ForgotPasswordService() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.prefix = "/forgotPassword";
        return _this;
    }
    ForgotPasswordService.prototype.Forgot = function (email) {
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
    ForgotPasswordService.prototype.ResetPassword = function (forgotUser) {
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
    ForgotPasswordService.prototype.ValidateResetPasswordToken = function (token) {
        return _super.prototype.get.call(this, this.prefix + '/validateResetPasswordToken?token=' + token)
            .toPromise()
            .then(function (result) {
            return result;
        })
            .catch(function (e) {
            return null;
        });
    };
    ForgotPasswordService.prototype.ResetPasswordByToken = function (token, newPassword) {
        var details = {
            "token": token,
            "newPassword": newPassword
        };
        return _super.prototype.put.call(this, this.prefix + '/resetPasswordByToken', JSON.stringify(details))
            .toPromise()
            .then(function (result) {
            return result;
        })
            .catch(function (e) {
            return null;
        });
    };
    return ForgotPasswordService;
}(basic_service_1.BasicService));
exports.ForgotPasswordService = ForgotPasswordService;
//# sourceMappingURL=forgotPassword.service.js.map