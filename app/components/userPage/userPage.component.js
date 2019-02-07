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
var global_service_1 = require("../../services/global/global.service");
var event_service_1 = require("../../services/event/event.service");
var cookie_service_1 = require("../../services/cookie/cookie.service");
var alert_service_1 = require("../../services/alert/alert.service");
var userPage_service_1 = require("../../services/userPage/userPage.service");
var snackbar_service_1 = require("../../services/snackbar/snackbar.service");
var UserPageComponent = /** @class */ (function () {
    function UserPageComponent(router, route, userPageService, alertService, snackbarService, globalService, eventService, cookieService) {
        var _this = this;
        this.router = router;
        this.route = route;
        this.userPageService = userPageService;
        this.alertService = alertService;
        this.snackbarService = snackbarService;
        this.globalService = globalService;
        this.eventService = eventService;
        this.cookieService = cookieService;
        this.isShowUserEditWindow = false;
        this.isShowUserReportWindow = false;
        this.isShowUserPasswordWindow = false;
        this.isShowUserPrivacyWindow = false;
        this.isOverlay = false;
        this.eventsIds = [];
        var self = this;
        //#region events
        eventService.Register("newUploadedImage", function (img) {
            self.user.profileImage = self.user.profileImage || null;
            self.user.profileImage = img;
        }, self.eventsIds);
        eventService.Register("deleteProfileImage", function () {
            self.user.profileImage = null;
        }, self.eventsIds);
        eventService.Register("closeUserEditWindow", function () {
            self.isShowUserEditWindow = false;
            self.eventService.Emit("setNavbarTop", true);
        }, self.eventsIds);
        eventService.Register("closeUserReportWindow", function () {
            self.isShowUserReportWindow = false;
            self.eventService.Emit("setNavbarTop", true);
        }, self.eventsIds);
        eventService.Register("closeUserPasswordWindow", function () {
            self.isShowUserPasswordWindow = false;
            self.eventService.Emit("setNavbarTop", true);
        }, self.eventsIds);
        eventService.Register("closeUserPrivacyWindow", function () {
            self.isShowUserPrivacyWindow = false;
            self.eventService.Emit("setNavbarTop", true);
        }, self.eventsIds);
        eventService.Register("ignoreFriendRequest", function (userId) {
            (userId == _this.user._id) && self.UnsetUserFriendStatus("isSendFriendRequest");
        }, self.eventsIds);
        //#endregion
        self.tabs = [
            {
                id: "edit",
                icon: "fas fa-user-edit",
                innerIconText: "",
                title: "עדכון פרטים",
                isShow: function () {
                    return self.IsUserPageSelf();
                },
                onClick: function () {
                    self.OpenUserWindow("isShowUserEditWindow");
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
                        action: function () {
                            self.alertService.Alert({
                                title: "הסרת חברות",
                                text: "האם להסיר את החברות עם " + self.user.fullName + "?",
                                type: alert_service_1.ALERT_TYPE.WARNING,
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
                                                type: alert_service_1.ALERT_TYPE.WARNING,
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
                        action: function () {
                            self.OpenUserWindow("isShowUserReportWindow");
                        }
                    }
                ]
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
                    self.eventService.Emit("addFriendRequest", self.user._id);
                }
            },
            {
                id: "friendRequestOptions",
                icon: "fas fa-user-friends",
                innerIconText: "",
                title: "בקשת חברות",
                isShow: function () {
                    return self.user.isSendFriendRequest;
                },
                options: [
                    {
                        text: "אישור חברות",
                        action: function () {
                            self.SetUserFriendStatus("isFriend");
                            self.eventService.Emit("addFriend", self.user._id);
                        }
                    },
                    {
                        text: "דחיית חברות",
                        action: function () {
                            self.UnsetUserFriendStatus("isSendFriendRequest");
                            self.eventService.Emit("ignoreFriendRequest", self.user._id);
                        }
                    }
                ]
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
                    self.eventService.Emit("removeFriendRequest", self.user._id);
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
                    self.eventService.Emit("openChat", self.user);
                }
            },
            {
                id: "menu",
                icon: "fas fa-bars",
                innerIconText: "",
                title: "עוד",
                onClick: function () {
                },
                isShow: function () {
                    return self.IsUserPageSelf();
                },
                options: [
                    {
                        text: "שינוי סיסמא",
                        action: function () {
                            self.OpenUserWindow("isShowUserPasswordWindow");
                        }
                    },
                    {
                        text: "הגדרות פרטיות",
                        action: function () {
                            self.OpenUserWindow("isShowUserPrivacyWindow");
                        }
                    },
                    {
                        text: "מחיקת משתמש",
                        action: function () {
                            self.alertService.Alert({
                                title: "מחיקת המשתמש באתר לצמיתות",
                                text: "משמעות פעולה זו היא מחיקת חשבונך באתר. \n" +
                                    "הפעולה תוביל למחיקת כל הנתונים בחשבון לרבות: \n" +
                                    "מידע אישי, שיחות, תמונות, וכל מידע אחר שהועלה על ידך לאתר.\n" +
                                    "יש לשים לב כי פעולה זו היא בלתי הפיכה ואינה ניתנת לשחזור!\n\n" +
                                    "<b>האם למחוק את המשתמש שלך מהאתר?</b>",
                                type: alert_service_1.ALERT_TYPE.DANGER,
                                confirmFunc: function () {
                                    self.userPageService.DeleteUserValidation().then(function (result) {
                                        result && self.alertService.Alert({
                                            title: "מחיקת משתמש",
                                            text: "לאישור המחיקה, יש להיכנס לקישור שנשלח לכתובת האימייל שלך.",
                                            type: alert_service_1.ALERT_TYPE.SUCCESS,
                                            showCancelButton: false
                                        });
                                    });
                                    // self.userPageService.DeleteUser().then(result => {
                                    //     if (result) {
                                    //         self.globalService.socket.emit("LogoutUserSessionServer",
                                    //             null,
                                    //             "המשתמש נמחק בהצלחה, החשבון נסגר.");
                                    //     }
                                    //     else {
                                    //         self.alertService.Alert({
                                    //             title: "מחיקת משתמש",
                                    //             text: "שגיאה בתהליך מחיקת המשתמש",
                                    //             type: ALERT_TYPE.WARNING,
                                    //             showCancelButton: false
                                    //         });
                                    //     }
                                    // });
                                }
                            });
                        }
                    }
                ]
            },
            {
                id: "manage",
                icon: "fas fa-cog",
                innerIconText: "",
                title: "ניהול משתמש",
                isShow: function () {
                    return self.user.isManagerView;
                },
                onClick: function () {
                    self.router.navigateByUrl("/management/" + self.user._id);
                }
            },
        ];
    }
    ;
    UserPageComponent.prototype.ngOnInit = function () {
        var _this = this;
        // In case of route params changed.
        this.route.params.subscribe(function (params) {
            // Reset user object.
            _this.user = null;
            // Close chat window in case it is open.
            _this.eventService.Emit("closeChat", true);
            // Get user details by user id route parameter.
            _this.userPageService.GetUserDetails(params["id"]).then(function (user) {
                // In case the user was found.
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
        self.globalService.SocketOn('GetFriendRequest', function (friendId) {
            if (friendId == self.user._id) {
                self.SetUserFriendStatus("isSendFriendRequest");
            }
        });
        // In case the user has been removed from the site.
        self.globalService.SocketOn('ClientRemoveFriendUser', function (friendId) {
            if (friendId == self.user._id) {
                self.router.navigateByUrl("/");
            }
        });
        // In case the user set private user.
        self.globalService.SocketOn('UserSetToPrivate', function (userId) {
            if (!self.IsUserPageSelf() && !self.user.isFriend) {
                self.router.navigateByUrl("/");
            }
        });
    };
    UserPageComponent.prototype.ngOnDestroy = function () {
        this.eventService.UnsubscribeEvents(this.eventsIds);
    };
    UserPageComponent.prototype.OpenUserWindow = function (windowShowPropertyName) {
        this.eventService.Emit("setNavbarUnder", true);
        this.eventService.Emit("closeChat", true);
        this[windowShowPropertyName] = true;
    };
    UserPageComponent.prototype.ChangeTabOptionsMenuState = function (tab) {
        this.CloseAllTabsOptionsMenus(tab.id);
        if (tab.options) {
            tab.isOptionsMenuOpen = !tab.isOptionsMenuOpen;
            this.isOverlay = tab.isOptionsMenuOpen;
        }
    };
    // Close all tabs without the tab with the given id.
    UserPageComponent.prototype.CloseAllTabsOptionsMenus = function (id) {
        this.tabs.forEach(function (tab) {
            if (tab.id != id) {
                tab.isOptionsMenuOpen = false;
            }
        });
        this.isOverlay = false;
    };
    UserPageComponent.prototype.InitializePage = function (user) {
        this.CloseAllTabsOptionsMenus();
        this.eventService.Emit("changeSearchInput", user.firstName + " " + user.lastName);
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
        return (this.user &&
            this.user.uid == this.cookieService.GetCookie(this.globalService.uidCookieName));
    };
    UserPageComponent.prototype.OpenProfileEditWindow = function () {
        this.CloseAllTabsOptionsMenus();
        if (this.IsUserPageSelf()) {
            this.eventService.Emit("openProfileEditWindow", true);
        }
    };
    UserPageComponent.prototype.CloseTabOptions = function (tab) {
        tab.isOptionsMenuOpen = false;
        this.isOverlay = tab.isOptionsMenuOpen;
    };
    UserPageComponent = __decorate([
        core_1.Component({
            selector: 'userPage',
            templateUrl: './userPage.html',
            providers: [userPage_service_1.UserPageService],
            styleUrls: ['./userPage.css']
        }),
        __metadata("design:paramtypes", [router_1.Router,
            router_1.ActivatedRoute,
            userPage_service_1.UserPageService,
            alert_service_1.AlertService,
            snackbar_service_1.SnackbarService,
            global_service_1.GlobalService,
            event_service_1.EventService,
            cookie_service_1.CookieService])
    ], UserPageComponent);
    return UserPageComponent;
}());
exports.UserPageComponent = UserPageComponent;
//# sourceMappingURL=userPage.component.js.map