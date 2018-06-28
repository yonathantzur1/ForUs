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
var snackbar_service_1 = require("../../services/snackbar/snackbar.service");
var UserPageComponent = /** @class */ (function () {
    function UserPageComponent(router, route, userPageService, alertService, snackbarService, globalService) {
        var _this = this;
        this.router = router;
        this.route = route;
        this.userPageService = userPageService;
        this.alertService = alertService;
        this.snackbarService = snackbarService;
        this.globalService = globalService;
        this.isTouchDevice = globalVariables.isTouchDevice;
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
        self.tabs = [
            {
                id: "edit",
                icon: "fas fa-user-edit",
                innerIconText: "",
                isSelected: false,
                title: "עריכת פרטים",
                isShow: function () {
                    return self.IsUserPageSelf();
                },
                onClick: function () {
                    this.isSelected = true;
                },
                onClose: function () {
                    this.isSelected = false;
                }
            },
            {
                id: "friendOptions",
                icon: "fas fa-user-check",
                innerIconText: "",
                title: "אפשרויות חברות",
                isShow: function () {
                    return self.user.isFriend;
                },
                options: [
                    {
                        text: "הסרת חברות",
                        icon: "fas fa-user-minus",
                        action: function () {
                            self.alertService.Alert({
                                title: "הסרת חברות",
                                text: "האם להסיר את החברות עם " + self.user.fullName + "?",
                                type: "warning",
                                confirmFunc: function () {
                                    self.userPageService.RemoveFriends(self.user._id).then(function (result) {
                                        if (result) {
                                            self.globalService.socket.emit("ServerRemoveFriend", self.user._id);
                                            self.UnsetUserFriendStatus("isFriend");
                                            self.snackbarService.Snackbar("הסרת החברות עם " + self.user.fullName + " בוצעה בהצלחה");
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
                        text: "דיווח",
                        icon: "fas fa-ban"
                    }
                ],
                onClick: function () {
                    this.isOptionsMenuOpen = !this.isOptionsMenuOpen;
                }
            },
            {
                id: "addFriendRequest",
                icon: "fas fa-user-plus",
                innerIconText: "",
                title: "בקשת חברות",
                isShow: function () {
                    return (!self.user.isFriend &&
                        !self.user.isGetFriendRequest &&
                        !self.user.isSendFriendRequest &&
                        !self.IsUserPageSelf());
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
                title: "ביטול בקשת חברות",
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
                title: "צ'אט",
                isShow: function () {
                    return self.user.isFriend;
                },
                onClick: function () {
                    self.globalService.setData("openChat", self.user);
                }
            },
            {
                id: "menu",
                icon: "fas fa-bars",
                innerIconText: "",
                title: "",
                onClick: function () {
                }
            }
        ];
    }
    UserPageComponent.prototype.ngOnInit = function () {
        var _this = this;
        // In case of route params changes.
        this.route.params.subscribe(function (params) {
            // Close chat window in case it is open.
            _this.globalService.setData("closeChat", true);
            _this.userPageService.GetUserDetails(params["id"]).then(function (user) {
                // In case the user found.
                if (user) {
                    user.fullName = user.firstName + " " + user.lastName;
                    _this.InitializePage(user);
                }
                else {
                    _this.router.navigateByUrl('/page-not-found');
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
        this.tabs.forEach(function (tab) {
            tab.isOptionsMenuOpen = false;
        });
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
    UserPageComponent.prototype.GetTabs = function () {
        return this.tabs.filter(function (option) {
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
    UserPageComponent.prototype.OpenProfileEditWindow = function () {
        if (this.IsUserPageSelf()) {
            this.globalService.setData("openProfileEditWindow", true);
        }
    };
    UserPageComponent.prototype.CloseOpenTabs = function () {
        this.tabs.forEach(function (tab) {
            tab.onClose && tab.onClose();
        });
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
            snackbar_service_1.SnackbarService,
            global_service_1.GlobalService])
    ], UserPageComponent);
    return UserPageComponent;
}());
exports.UserPageComponent = UserPageComponent;
//# sourceMappingURL=userPage.component.js.map