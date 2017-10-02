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
var NavbarService = /** @class */ (function (_super) {
    __extends(NavbarService, _super);
    function NavbarService() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.prefix = "/api/navbar";
        return _this;
    }
    NavbarService.prototype.GetFriends = function (friendsIds) {
        return _super.prototype.post.call(this, this.prefix + '/getFriends', JSON.stringify(friendsIds))
            .toPromise()
            .then(function (result) {
            return result.json();
        })
            .catch(function (result) {
            return null;
        });
    };
    NavbarService.prototype.GetMainSearchResults = function (searchInput, searchLimit) {
        var details = { "searchInput": searchInput, "searchLimit": searchLimit };
        return _super.prototype.post.call(this, this.prefix + '/getMainSearchResults', JSON.stringify(details))
            .toPromise()
            .then(function (result) {
            return result.json();
        })
            .catch(function (result) {
            return null;
        });
    };
    NavbarService.prototype.GetMainSearchResultsWithImages = function (ids) {
        var details = { ids: ids };
        return _super.prototype.post.call(this, this.prefix + '/getMainSearchResultsWithImages', JSON.stringify(details))
            .toPromise()
            .then(function (result) {
            return result.json();
        })
            .catch(function (result) {
            return null;
        });
    };
    NavbarService.prototype.GetUserMessagesNotifications = function () {
        return _super.prototype.get.call(this, this.prefix + '/getUserMessagesNotifications')
            .toPromise()
            .then(function (result) {
            return result.json();
        })
            .catch(function (result) {
            return null;
        });
    };
    NavbarService.prototype.UpdateMessagesNotifications = function (messagesNotifications, friendId) {
        var details = { messagesNotifications: messagesNotifications };
        _super.prototype.post.call(this, this.prefix + '/updateMessagesNotifications', JSON.stringify(details)).toPromise();
    };
    NavbarService.prototype.RemoveMessagesNotifications = function (messagesNotifications) {
        var details = { messagesNotifications: messagesNotifications };
        _super.prototype.post.call(this, this.prefix + '/removeMessagesNotifications', JSON.stringify(details)).toPromise();
    };
    NavbarService.prototype.GetUserFriendRequests = function () {
        return _super.prototype.get.call(this, this.prefix + '/getUserFriendRequests')
            .toPromise()
            .then(function (result) {
            return result.json();
        })
            .catch(function (result) {
            return null;
        });
    };
    NavbarService.prototype.AddFriendRequest = function (friendId) {
        var details = { friendId: friendId };
        return _super.prototype.post.call(this, this.prefix + '/addFriendRequest', JSON.stringify(details))
            .toPromise()
            .then(function (result) {
            return result.json();
        })
            .catch(function (result) {
            return null;
        });
    };
    NavbarService.prototype.RemoveFriendRequest = function (friendId) {
        var details = { friendId: friendId };
        return _super.prototype.post.call(this, this.prefix + '/removeFriendRequest', JSON.stringify(details))
            .toPromise()
            .then(function (result) {
            return result.json();
        })
            .catch(function (result) {
            return null;
        });
    };
    NavbarService.prototype.IgnoreFriendRequest = function (friendId) {
        var details = { friendId: friendId };
        return _super.prototype.post.call(this, this.prefix + '/ignoreFriendRequest', JSON.stringify(details))
            .toPromise()
            .then(function (result) {
            return result.json();
        })
            .catch(function (result) {
            return null;
        });
    };
    NavbarService.prototype.AddFriend = function (friendId) {
        var details = { friendId: friendId };
        return _super.prototype.post.call(this, this.prefix + '/addFriend', JSON.stringify(details))
            .toPromise()
            .then(function (result) {
            return result.json();
        })
            .catch(function (result) {
            return null;
        });
    };
    return NavbarService;
}(basic_service_1.BasicService));
exports.NavbarService = NavbarService;
//# sourceMappingURL=navbar.service.js.map