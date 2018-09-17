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
var basic_service_1 = require("../../../basic/basic.service");
var PermissionsCardService = /** @class */ (function (_super) {
    __extends(PermissionsCardService, _super);
    function PermissionsCardService() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.prefix = "/api/permissions";
        return _this;
    }
    PermissionsCardService.prototype.GetAllPermissions = function () {
        return _super.prototype.get.call(this, this.prefix + '/getAllPermissions')
            .toPromise()
            .then(function (result) {
            return result;
        })
            .catch(function (e) {
            return null;
        });
    };
    PermissionsCardService.prototype.GetUserPermissions = function (userId) {
        return _super.prototype.get.call(this, this.prefix + '/getUserPermissions?userId=' + userId)
            .toPromise()
            .then(function (result) {
            return result;
        })
            .catch(function (e) {
            return null;
        });
    };
    PermissionsCardService.prototype.UpdatePermissions = function (userId, permissions) {
        var data = { userId: userId, permissions: permissions };
        return _super.prototype.put.call(this, this.prefix + '/updatePermissions', data)
            .toPromise()
            .then(function (result) {
            return result;
        })
            .catch(function (e) {
            return null;
        });
    };
    return PermissionsCardService;
}(basic_service_1.BasicService));
exports.PermissionsCardService = PermissionsCardService;
//# sourceMappingURL=permissionsCard.service.js.map