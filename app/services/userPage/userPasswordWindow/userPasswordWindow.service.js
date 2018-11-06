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
var basic_service_1 = require("../../basic/basic.service");
var UserPasswordWindowService = /** @class */ (function (_super) {
    __extends(UserPasswordWindowService, _super);
    function UserPasswordWindowService() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.prefix = "/api/userPasswordWindow";
        return _this;
    }
    UserPasswordWindowService.prototype.UpdateUserPassword = function (password) {
        return _super.prototype.put.call(this, this.prefix + '/updateUserPassword', password)
            .toPromise()
            .then(function (result) {
            return result;
        })
            .catch(function (e) {
            return null;
        });
    };
    UserPasswordWindowService.prototype.ChangePasswordByMail = function () {
        return _super.prototype.get.call(this, this.prefix + '/changePasswordByMail')
            .toPromise()
            .then(function (result) {
            return result;
        })
            .catch(function (e) {
            return null;
        });
    };
    return UserPasswordWindowService;
}(basic_service_1.BasicService));
exports.UserPasswordWindowService = UserPasswordWindowService;
//# sourceMappingURL=userPasswordWindow.service.js.map