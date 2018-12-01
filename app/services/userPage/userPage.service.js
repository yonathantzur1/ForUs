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
var basic_service_1 = require("../basic/basic.service");
var UserPageService = /** @class */ (function (_super) {
    __extends(UserPageService, _super);
    function UserPageService() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.prefix = "/api/userPage";
        return _this;
    }
    UserPageService.prototype.GetUserDetails = function (id) {
        return _super.prototype.get.call(this, this.prefix + '/getUserDetails?id=' + id)
            .toPromise()
            .then(function (result) {
            return result;
        })
            .catch(function (e) {
            return null;
        });
    };
    UserPageService.prototype.RemoveFriends = function (friendId) {
        return _super.prototype.delete.call(this, this.prefix + '/removeFriends?friendId=' + friendId)
            .toPromise()
            .then(function (result) {
            return result;
        })
            .catch(function (e) {
            return null;
        });
    };
    UserPageService.prototype.DeleteUser = function () {
        return _super.prototype.delete.call(this, this.prefix + '/deleteUser')
            .toPromise()
            .then(function (result) {
            return result;
        })
            .catch(function (e) {
            return null;
        });
    };
    return UserPageService;
}(basic_service_1.BasicService));
exports.UserPageService = UserPageService;
//# sourceMappingURL=userPage.service.js.map