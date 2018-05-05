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
var router_2 = require("@angular/router");
var global_service_1 = require("../../services/global/global.service");
var alert_service_1 = require("../../services/alert/alert.service");
var userPage_service_1 = require("../../services/userPage/userPage.service");
var UserPageComponent = /** @class */ (function () {
    function UserPageComponent(router, route, userPageService, alertService, globalService) {
        var _this = this;
        this.router = router;
        this.route = route;
        this.userPageService = userPageService;
        this.alertService = alertService;
        this.globalService = globalService;
        this.subscribeObj = this.globalService.data.subscribe(function (value) {
            if (value["newUploadedImage"]) {
                if (!_this.user.profileImage) {
                    _this.user.profileImage = {};
                }
                _this.user.profileImage.image = value["newUploadedImage"];
            }
            if (value["isImageDeleted"]) {
                delete _this.user.profileImage;
            }
        });
        var self = this;
        self.options = [
            {
                id: "removeFriend",
                icon: "fas fa-user-minus",
                innerIconText: "",
                isShow: function () {
                    return self.user.isFriend;
                },
                onClick: function () {
                    self.alertService.Alert({
                        title: "הסרת חברות",
                        text: "האם להסיר את החברות עם " + self.user.fullName + "?",
                        type: "warning",
                        confirmFunc: function () {
                            self.userPageService.RemoveFriends(self.user._id).then(function (result) {
                                if (result) {
                                    self.globalService.socket.emit("ServerRemoveFriend", self.user._id);
                                    self.UnsetUserFriendStatus("isFriend");
                                    snackbar("הסרת החברות עם " + self.user.fullName + " בוצעה בהצלחה");
                                    self.globalService.RefreshSocket();
                                }
                                else {
                                    self.alertService.Alert({
                                        title: "שגיאה בהסרת החברות",
                                        text: "אירעה שגיאה בהסרת החברות עם " + self.user.fullName,
                                        type: "warning",
                                        showCancelButton: false
                                    });
                                }
                            });
                        }
                    });
                }
            },
            {
                id: "addFriendRequest",
                icon: "fas fa-user-plus",
                innerIconText: "",
                isShow: function () {
                    return (!self.user.isFriend &&
                        !self.user.isGetFriendRequest &&
                        !self.user.isSendFriendRequest);
                },
                onClick: function () {
                    self.SetUserFriendStatus("isGetFriendRequest");
                    self.globalService.setData("AddFriendRequest", self.user._id);
                }
            },
            {
                id: "removeFriendRequest",
                icon: "fas fa-user-times",
                innerIconText: "",
                isShow: function () {
                    return self.user.isGetFriendRequest;
                },
                onClick: function () {
                    self.UnsetUserFriendStatus("isGetFriendRequest");
                    self.globalService.setData("RemoveFriendRequest", self.user._id);
                }
            },
            {
                id: "openChat",
                icon: "far fa-edit",
                innerIconText: "",
                isShow: function () {
                    return self.user.isFriend;
                },
                onClick: function () {
                    self.globalService.setData("openChat", self.user);
                }
            },
            {
                id: "wave",
                icon: "far fa-hand-paper",
                innerIconText: "",
                isShow: function () {
                    return self.user.isFriend;
                },
                onClick: function () {
                }
            },
            {
                id: "menu",
                icon: "fas fa-bars",
                innerIconText: "",
                onClick: function () {
                }
            }
        ];
    }
    UserPageComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.route.params.subscribe(function (params) {
            _this.userPageService.GetUserDetails(params["id"]).then(function (user) {
                if (user) {
                    user.fullName = user.firstName + " " + user.lastName;
                    _this.InitializePage(user);
                }
            });
        });
        var self = this;
        self.globalService.SocketOn('ClientAddFriend', function (friend) {
            if (friend._id == self.user._id) {
                self.SetUserFriendStatus("isFriend");
            }
        });
        self.globalService.SocketOn('ClientFriendAddedUpdate', function (friend) {
            if (friend._id == self.user._id) {
                self.SetUserFriendStatus("isFriend");
            }
        });
        self.globalService.SocketOn('ClientRemoveFriend', function (friendId) {
            if (friendId == self.user._id) {
                self.UnsetUserFriendStatus("isFriend");
            }
        });
        self.globalService.SocketOn('ClientIgnoreFriendRequest', function (friendId) {
            if (friendId == self.user._id) {
                self.UnsetUserFriendStatus("isGetFriendRequest");
            }
        });
        // In case the user has been removed from the site.
        self.globalService.SocketOn('ClientRemoveFriendUser', function (friendId) {
            if (friendId == self.user._id) {
                self.router.navigateByUrl("/");
            }
        });
    };
    UserPageComponent.prototype.ngOnDestroy = function () {
        this.subscribeObj.unsubscribe();
    };
    UserPageComponent.prototype.InitializePage = function (user) {
        this.globalService.setData("changeSearchInput", user.firstName + " " + user.lastName);
        this.user = user;
    };
    UserPageComponent.prototype.UnsetUserFriendStatus = function (field) {
        // Set the requested field to true.
        this.user[field] = false;
    };
    UserPageComponent.prototype.SetUserFriendStatus = function (field) {
        this.user.isFriend = false;
        this.user.isGetFriendRequest = false;
        this.user.isSendFriendRequest = false;
        // Set the requested field to true.
        this.user[field] = true;
    };
    UserPageComponent.prototype.GetOptions = function () {
        return this.options.filter(function (option) {
            if (!option.isShow) {
                return true;
            }
            else {
                return option.isShow();
            }
        });
    };
    // Return true if the user page belongs to the current user.
    UserPageComponent.prototype.IsUserPageSelf = function () {
        return (this.user && this.user.uid == getCookie(this.globalService.uidCookieName));
    };
    UserPageComponent.prototype.OpenEditWindow = function () {
        if (this.IsUserPageSelf()) {
            this.globalService.setData("openProfileEditWindow", true);
        }
    };
    UserPageComponent = __decorate([
        core_1.Component({
            selector: 'userPage',
            templateUrl: './userPage.html',
            providers: [userPage_service_1.UserPageService]
        }),
        __metadata("design:paramtypes", [router_2.Router,
            router_1.ActivatedRoute,
            userPage_service_1.UserPageService,
            alert_service_1.AlertService,
            global_service_1.GlobalService])
    ], UserPageComponent);
    return UserPageComponent;
}());
exports.UserPageComponent = UserPageComponent;
//# sourceMappingURL=userPage.component.js.map