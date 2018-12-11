import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { GlobalService } from '../../services/global/global.service';
import { CookieService } from '../../services/cookie/cookie.service';
import { AlertService, ALERT_TYPE } from '../../services/alert/alert.service';
import { UserPageService } from '../../services/userPage/userPage.service';
import { SnackbarService } from '../../services/snackbar/snackbar.service';

@Component({
    selector: 'userPage',
    templateUrl: './userPage.html',
    providers: [UserPageService],
    styleUrls: ['./userPage.css']
})

export class UserPageComponent implements OnInit, OnDestroy {
    isLoading: boolean;
    isShowUserEditWindow: boolean = false;
    isShowUserReportWindow: boolean = false;
    isShowUserPasswordWindow: boolean = false;
    isShowUserPrivacyWindow: boolean = false;
    isOverlay: boolean = false;;
    user: any;
    tabs: any;

    subscribeObj: any;

    constructor(private router: Router,
        private route: ActivatedRoute,
        private userPageService: UserPageService,
        private alertService: AlertService,
        private snackbarService: SnackbarService,
        private globalService: GlobalService,
        private cookieService: CookieService) {
        this.subscribeObj = this.globalService.data.subscribe((value: any) => {
            // In case the user profile picture updated.
            if (value["newUploadedImage"]) {
                this.user.profileImage = this.user.profileImage || {};
                this.user.profileImage.image = value["newUploadedImage"];
            }

            // In case the user profile picture deleted.
            if (value["isImageDeleted"]) {
                delete this.user.profileImage;
            }

            if (value["closeUserEditWindow"]) {
                this.isShowUserEditWindow = false;
                this.globalService.setData("setNavbarTop", true);
            }

            if (value["closeUserReportWindow"]) {
                this.isShowUserReportWindow = false;
                this.globalService.setData("setNavbarTop", true);
            }

            if (value["closeUserPasswordWindow"]) {
                this.isShowUserPasswordWindow = false;
                this.globalService.setData("setNavbarTop", true);
            }

            if (value["closeUserPrivacyWindow"]) {
                this.isShowUserPrivacyWindow = false;
                this.globalService.setData("setNavbarTop", true);
            }

            if (value["IgnoreFriendRequest"]) {
                if (value["IgnoreFriendRequest"] == this.user._id) {
                    this.UnsetUserFriendStatus("isSendFriendRequest");
                }
            }

        });

        var self = this;

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
                                type: ALERT_TYPE.WARNING,
                                confirmFunc: function () {
                                    self.userPageService.RemoveFriends(self.user._id).then(result => {
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
                                                type: ALERT_TYPE.WARNING,
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
                    self.globalService.setData("addFriendRequest", self.user._id);
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
                            self.globalService.setData("addFriend", self.user._id);
                        }
                    },
                    {
                        text: "דחיית חברות",
                        action: function () {
                            self.UnsetUserFriendStatus("isSendFriendRequest");
                            self.globalService.setData("ignoreFriendRequest", self.user._id);
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
                    self.globalService.setData("removeFriendRequest", self.user._id);
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
                                type: ALERT_TYPE.DANGER,
                                confirmFunc: function () {
                                    self.userPageService.DeleteUser().then(result => {
                                        if (result) {
                                            self.globalService.socket.emit("LogoutUserSessionServer",
                                                null,
                                                "המשתמש נמחק בהצלחה, החשבון נסגר.");
                                        }
                                        else {
                                            self.alertService.Alert({
                                                title: "מחיקת משתמש",
                                                text: "שגיאה בתהליך מחיקת המשתמש",
                                                type: ALERT_TYPE.WARNING,
                                                showCancelButton: false
                                            });
                                        }
                                    })
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
        ]
    }

    ngOnInit() {
        // In case of route params changed.
        this.route.params.subscribe(params => {
            // Reset user object.
            this.user = null;

            // Close chat window in case it is open.
            this.globalService.setData("closeChat", true);

            // Get user details by user id route parameter.
            this.userPageService.GetUserDetails(params["id"]).then((user: any) => {
                // In case the user was found.
                if (user) {
                    user.fullName = user.firstName + " " + user.lastName;
                    this.InitializePage(user);
                }
                else {
                    this.router.navigateByUrl('/page-not-found');
                }
            });
        });

        var self = this;

        self.globalService.SocketOn('ClientAddFriend', function (friend: any) {
            if (friend._id == self.user._id) {
                self.SetUserFriendStatus("isFriend");
            }
        });

        self.globalService.SocketOn('ClientFriendAddedUpdate', function (friend: any) {
            if (friend._id == self.user._id) {
                self.SetUserFriendStatus("isFriend");
            }
        });

        self.globalService.SocketOn('ClientRemoveFriend', function (friendId: string) {
            if (friendId == self.user._id) {
                self.UnsetUserFriendStatus("isFriend");
            }
        });

        self.globalService.SocketOn('ClientIgnoreFriendRequest', function (friendId: string) {
            if (friendId == self.user._id) {
                self.UnsetUserFriendStatus("isGetFriendRequest");
            }
        });

        self.globalService.SocketOn('GetFriendRequest', function (friendId: string) {
            if (friendId == self.user._id) {
                self.SetUserFriendStatus("isSendFriendRequest");
            }
        });

        // In case the user has been removed from the site.
        self.globalService.SocketOn('ClientRemoveFriendUser', function (friendId: string) {
            if (friendId == self.user._id) {
                self.router.navigateByUrl("/");
            }
        });

        // In case the user set private user.
        self.globalService.SocketOn('UserSetToPrivate', function (userId: string) {
            if (!self.IsUserPageSelf() && !self.user.isFriend) {
                self.router.navigateByUrl("/");
            }
        });
    }

    ngOnDestroy() {
        this.subscribeObj.unsubscribe();
    }

    OpenUserWindow(windowShowPropertyName: string) {
        this.globalService.setData("setNavbarUnder", true);
        this.globalService.setData("closeChat", true);
        this[windowShowPropertyName] = true;
    }

    ChangeTabOptionsMenuState(tab: any) {
        this.CloseAllTabsOptionsMenus(tab.id);

        if (tab.options) {
            tab.isOptionsMenuOpen = !tab.isOptionsMenuOpen;
            this.isOverlay = tab.isOptionsMenuOpen;
        }
    }

    // Close all tabs without the tab with the given id.
    CloseAllTabsOptionsMenus(id?: string) {
        this.tabs.forEach((tab: any) => {
            if (tab.id != id) {
                tab.isOptionsMenuOpen = false;
            }
        });

        this.isOverlay = false;
    }

    InitializePage(user: any) {
        this.CloseAllTabsOptionsMenus();
        this.globalService.setData("changeSearchInput", user.firstName + " " + user.lastName);
        this.user = user;
    }

    UnsetUserFriendStatus(field: string) {
        // Set the requested field to true.
        this.user[field] = false;
    }

    SetUserFriendStatus(field: string) {
        this.user.isFriend = false;
        this.user.isGetFriendRequest = false;
        this.user.isSendFriendRequest = false;

        // Set the requested field to true.
        this.user[field] = true;
    }

    GetTabs() {
        return this.tabs.filter((option: any) => {
            if (!option.isShow) {
                return true;
            }
            else {
                return option.isShow();
            }
        })
    }

    // Return true if the user page belongs to the current user.
    IsUserPageSelf() {
        return (this.user &&
            this.user.uid == this.cookieService.GetCookie(this.globalService.uidCookieName));
    }

    OpenProfileEditWindow() {
        this.CloseAllTabsOptionsMenus();

        if (this.IsUserPageSelf()) {
            this.globalService.setData("openProfileEditWindow", true);
        }
    }

    CloseTabOptions(tab: any) {
        tab.isOptionsMenuOpen = false;
        this.isOverlay = tab.isOptionsMenuOpen;
    }
}