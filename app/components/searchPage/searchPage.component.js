"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var router_1 = require("@angular/router");
var alert_service_1 = require("../../services/alert/alert.service");
var global_service_1 = require("../../services/global/global.service");
var searchPage_service_1 = require("../../services/searchPage/searchPage.service");
var FriendsStatus = /** @class */ (function () {
    function FriendsStatus() {
    }
    return FriendsStatus;
}());
var SearchPageComponent = /** @class */ (function () {
    function SearchPageComponent(router, route, alertService, globalService, searchPageService) {
        var _this = this;
        this.router = router;
        this.route = route;
        this.alertService = alertService;
        this.globalService = globalService;
        this.searchPageService = searchPageService;
        this.isLoading = false;
        this.subscribeObj = this.globalService.data.subscribe(function (value) {
            if (value["IgnoreFriendRequest"]) {
                _this.UnsetUserFriendStatus(value["IgnoreFriendRequest"], "isSendFriendRequest");
            }
            if (value["SendFriendRequest"]) {
                _this.SetUserFriendStatus(value["SendFriendRequest"], "isGetFriendRequest");
            }
            if (value["RemoveFriendRequest"]) {
                _this.UnsetUserFriendStatus(value["RemoveFriendRequest"], "isGetFriendRequest");
            }
        });
    }
    SearchPageComponent.prototype.ngOnInit = function () {
        var _this = this;
        var errorJson = {
            title: "שגיאה",
            text: "אופס... שגיאה בטעינת הדף",
            showCancelButton: false,
            type: alert_service_1.ALERT_TYPE.DANGER
        };
        // In case of route params changes.
        this.route.params.subscribe(function (params) {
            _this.searchString = params["name"];
            _this.globalService.setData("changeSearchInput", _this.searchString);
            // In case there is a search string.
            if (_this.searchString) {
                _this.users = [];
                _this.isLoading = true;
                _this.searchPageService.GetUserFriendsStatus().then(function (friendsStatus) {
                    if (friendsStatus) {
                        // Search users by given name parameter.
                        _this.searchPageService.GetSearchResults(_this.searchString).then(function (users) {
                            _this.isLoading = false;
                            if (users) {
                                users.forEach(function (user) {
                                    var userId = user._id;
                                    // In case the result user and the current user are friends.
                                    if (friendsStatus.friends.indexOf(userId) != -1) {
                                        user.isFriend = true;
                                        return;
                                    }
                                    // In case the result user sent a friend request to the current user.
                                    else if (friendsStatus.get.indexOf(userId) != -1) {
                                        user.isSendFriendRequest = true;
                                        return;
                                    }
                                    // In case the current user sent a friend request to the result user.
                                    else if (friendsStatus.send.indexOf(userId) != -1) {
                                        user.isGetFriendRequest = true;
                                        return;
                                    }
                                });
                                _this.users = users;
                            }
                            else {
                                _this.alertService.Alert(errorJson);
                            }
                        });
                    }
                    else {
                        _this.isLoading = false;
                        _this.alertService.Alert(errorJson);
                    }
                });
            }
            else {
                _this.router.navigateByUrl('');
            }
        });
        var self = this;
        self.globalService.SocketOn('ClientAddFriend', function (friend) {
            self.SetUserFriendStatus(friend._id, "isFriend");
        });
        self.globalService.SocketOn('ClientFriendAddedUpdate', function (friend) {
            self.SetUserFriendStatus(friend._id, "isFriend");
        });
        self.globalService.SocketOn('ClientRemoveFriend', function (friendId) {
            self.UnsetUserFriendStatus(friendId, "isFriend");
        });
        self.globalService.SocketOn('ClientIgnoreFriendRequest', function (friendId) {
            self.UnsetUserFriendStatus(friendId, "isGetFriendRequest");
        });
        self.globalService.SocketOn('GetFriendRequest', function (friendId) {
            self.SetUserFriendStatus(friendId, "isSendFriendRequest");
        });
        // In case the user set private user.
        self.globalService.SocketOn('UserSetToPrivate', function (userId) {
            var user = self.GetUserById(userId);
            if (userId != self.GetCurrentUserId() && !user.isFriend) {
                self.RemoveUserFromUsers(userId);
            }
        });
    };
    SearchPageComponent.prototype.ngOnDestroy = function () {
        this.subscribeObj.unsubscribe();
    };
    SearchPageComponent.prototype.ResetUserFriendStatus = function (user) {
        user.isFriend = false;
        user.isSendFriendRequest = false;
        user.isGetFriendRequest = false;
    };
    SearchPageComponent.prototype.GetUserById = function (userId) {
        for (var i = 0; i < this.users.length; i++) {
            var user = this.users[i];
            if (user._id == userId) {
                return user;
            }
        }
        return null;
    };
    SearchPageComponent.prototype.GetCurrentUserId = function () {
        return this.globalService.userId;
    };
    SearchPageComponent.prototype.SetUserFriendStatus = function (userId, statusName) {
        var user = this.GetUserById(userId);
        if (user) {
            this.ResetUserFriendStatus(user);
            user[statusName] = true;
        }
    };
    SearchPageComponent.prototype.UnsetUserFriendStatus = function (userId, statusName) {
        var user = this.GetUserById(userId);
        if (user) {
            user[statusName] = false;
        }
    };
    SearchPageComponent.prototype.UserClick = function (userId) {
        this.router.navigateByUrl('/profile/' + userId);
    };
    SearchPageComponent.prototype.UserClickTouch = function (userId) {
        if (this.globalService.isTouchDevice) {
            this.router.navigateByUrl('/profile/' + userId);
        }
    };
    SearchPageComponent.prototype.IsFriendRequestAction = function (user) {
        if ((!user.isFriend && this.GetCurrentUserId() != user._id) ||
            user.isGetFriendRequest ||
            user.isSendFriendRequest) {
            return true;
        }
        return false;
    };
    SearchPageComponent.prototype.AddFriendRequest = function (user) {
        this.globalService.setData("addFriendRequest", user._id);
        user.isGetFriendRequest = true;
    };
    SearchPageComponent.prototype.RemoveFriendRequest = function (user) {
        this.globalService.setData("removeFriendRequest", user._id);
        user.isGetFriendRequest = false;
    };
    SearchPageComponent.prototype.RemoveUserFromUsers = function (userId) {
        this.users = this.users.filter(function (user) {
            return (user._id != userId);
        });
    };
    SearchPageComponent = __decorate([
        core_1.Component({
            selector: 'searchPage',
            templateUrl: './searchPage.html',
            providers: [searchPage_service_1.SearchPageService]
        }),
        __metadata("design:paramtypes", [router_1.Router,
            router_1.ActivatedRoute,
            alert_service_1.AlertService,
            global_service_1.GlobalService,
            searchPage_service_1.SearchPageService])
    ], SearchPageComponent);
    return SearchPageComponent;
}());
exports.SearchPageComponent = SearchPageComponent;
//# sourceMappingURL=searchPage.component.js.map