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
var ManagementService = /** @class */ (function (_super) {
    __extends(ManagementService, _super);
    function ManagementService() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.prefix = "/api/management";
        return _this;
    }
    ManagementService.prototype.GetUserByName = function (searchInput) {
        var details = { searchInput: searchInput };
        return _super.prototype.post.call(this, this.prefix + '/getUserByName', details)
            .toPromise()
            .then(function (result) {
            return result;
        })
            .catch(function (e) {
            return null;
        });
    };
    ManagementService.prototype.GetUserFriends = function (friendsIds) {
        var details = { friendsIds: friendsIds };
        return _super.prototype.post.call(this, this.prefix + '/getUserFriends', details)
            .toPromise()
            .then(function (result) {
            return result;
        })
            .catch(function (e) {
            return null;
        });
    };
    ManagementService.prototype.EditUser = function (updateFields) {
        var details = { updateFields: updateFields };
        return _super.prototype.put.call(this, this.prefix + '/editUser', details)
            .toPromise()
            .then(function (result) {
            return result;
        })
            .catch(function (e) {
            return null;
        });
    };
    ManagementService.prototype.BlockUser = function (blockObj) {
        var details = { blockObj: blockObj };
        return _super.prototype.put.call(this, this.prefix + '/blockUser', details)
            .toPromise()
            .then(function (result) {
            return result;
        })
            .catch(function (e) {
            return null;
        });
    };
    ManagementService.prototype.UnblockUser = function (userId) {
        var details = { userId: userId };
        return _super.prototype.put.call(this, this.prefix + '/unblockUser', details)
            .toPromise()
            .then(function (result) {
            return result;
        })
            .catch(function (e) {
            return null;
        });
    };
    ManagementService.prototype.RemoveFriends = function (userId, friendId) {
        var details = { userId: userId, friendId: friendId };
        return _super.prototype.delete.call(this, this.prefix + '/removeFriends?userId=' + userId + "&friendId=" + friendId)
            .toPromise()
            .then(function (result) {
            return result;
        })
            .catch(function (e) {
            return null;
        });
    };
    ManagementService.prototype.DeleteUser = function (userId) {
        return _super.prototype.delete.call(this, this.prefix + '/deleteUser?userId=' + userId)
            .toPromise()
            .then(function (result) {
            return result;
        })
            .catch(function (e) {
            return null;
        });
    };
    return ManagementService;
}(basic_service_1.BasicService));
exports.ManagementService = ManagementService;
//# sourceMappingURL=management.service.js.map