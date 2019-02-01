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
Object.defineProperty(exports, "__esModule", { value: true });
var basic_service_1 = require("../../../../services/basic/basic.service");
var DeleteUserService = /** @class */ (function (_super) {
    __extends(DeleteUserService, _super);
    function DeleteUserService() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.prefix = "/deleteUser";
        return _this;
    }
    DeleteUserService.prototype.ValidateDeleteUserToken = function (token) {
        return _super.prototype.get.call(this, this.prefix + '/validateDeleteUserToken?token=' + token)
            .toPromise()
            .then(function (result) {
            return result;
        })
            .catch(function (e) {
            return null;
        });
    };
    DeleteUserService.prototype.DeleteAccount = function (token, password) {
        var details = {
            token: token,
            password: password
        };
        return _super.prototype.put.call(this, this.prefix + '/deleteAccount', details)
            .toPromise()
            .then(function (result) {
            return result;
        })
            .catch(function (e) {
            return null;
        });
    };
    return DeleteUserService;
}(basic_service_1.BasicService));
exports.DeleteUserService = DeleteUserService;
//# sourceMappingURL=deleteUser.service.js.map