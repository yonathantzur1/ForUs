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
var basic_service_1 = require("../../basic/basic.service");
var UserPrivacyWindowService = /** @class */ (function (_super) {
    __extends(UserPrivacyWindowService, _super);
    function UserPrivacyWindowService() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.prefix = "/api/userPrivacyWindow";
        return _this;
    }
    UserPrivacyWindowService.prototype.GetUserPrivacyStatus = function () {
        return _super.prototype.get.call(this, this.prefix + '/getUserPrivacyStatus')
            .toPromise()
            .then(function (result) {
            return result;
        })
            .catch(function (e) {
            return null;
        });
    };
    UserPrivacyWindowService.prototype.SetUserPrivacy = function (isPrivate) {
        var details = { isPrivate: isPrivate };
        return _super.prototype.put.call(this, this.prefix + '/setUserPrivacy', details)
            .toPromise()
            .then(function (result) {
            return result;
        })
            .catch(function (e) {
            return null;
        });
    };
    return UserPrivacyWindowService;
}(basic_service_1.BasicService));
exports.UserPrivacyWindowService = UserPrivacyWindowService;
//# sourceMappingURL=userPrivacyWindow.service.js.map