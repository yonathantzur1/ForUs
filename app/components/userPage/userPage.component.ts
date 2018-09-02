import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { GlobalService } from '../../services/global/global.service';
import { AlertService, ALERT_TYPE } from '../../services/alert/alert.service';
import { UserPageService } from '../../services/userPage/userPage.service';
import { SnackbarService } from '../../services/snackbar/snackbar.service';

declare function getCookie(name: string): string;
declare var globalVariables: any;

@Component({
    selector: 'userPage',
    templateUrl: './userPage.html',
    providers: [UserPageService]
})

export class UserPageComponent implements OnInit, OnDestroy {
    isTouchDevice: boolean = globalVariables.isTouchDevice;
    isLoading: boolean;
    isShowUserEdit: boolean = false;
    user: any;
    tabs: any;

    subscribeObj: any;

    constructor(private router: Router,
        private route: ActivatedRoute,
        private userPageService: UserPageService,
        private alertService: AlertService,
        private snackbarService: SnackbarService,
        private globalService: GlobalService) {
        this.subscribeObj = this.globalService.data.subscribe((value: any) => {
            if (value["newUploadedImage"]) {
                if (!this.user.profileImage) {
                    this.user.profileImage = {};
                }

                this.user.profileImage.image = value["newUploadedImage"];
            }

            if (value["isImageDeleted"]) {
                delete this.user.profileImage;
            }

            if (value["closeUserEditWindow"]) {
                this.isShowUserEdit = false;
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
                    self.isShowUserEdit = true;
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
                onClick: function () {

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
                            self.userPageService.ChangePassword().then(result => {
                                if (result) {
                                    self.alertService.Alert({
                                        title: "שינוי סיסמא",
                                        text: "יש להיכנס לקישור שנשלח לכתובת האימייל שלך.",
                                        type: ALERT_TYPE.SUCCESS,
                                        showCancelButton: false
                                    });
                                }
                                else {
                                    self.alertService.Alert({
                                        title: "שינוי סיסמא",
                                        text: "שגיאה בתהליך שינוי הסיסמא",
                                        type: ALERT_TYPE.WARNING,
                                        showCancelButton: false
                                    });
                                }
                            });
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
                                "יש לשים לב כי פעולה זו היא בלתי הפיכה, ואינה ניתנת לשחזור!\n\n" +
                                "<b>האם למחוק את המשתמש שלך מהאתר?</b>",
                                type: ALERT_TYPE.DANGER                                
                            });
                        }
                    }
                ]
            }
        ]
    }

    ngOnInit() {
        // In case of route params changes.
        this.route.params.subscribe(params => {
            // Close chat window in case it is open.
            this.globalService.setData("closeChat", true);

            this.userPageService.GetUserDetails(params["id"]).then((user: any) => {
                // In case the user found.
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

        // In case the user has been removed from the site.
        self.globalService.SocketOn('ClientRemoveFriendUser', function (friendId: string) {
            if (friendId == self.user._id) {
                self.router.navigateByUrl("/");
            }
        });
    }

    ngOnDestroy() {
        this.subscribeObj.unsubscribe();
    }

    ChangeTabOptionsMenuState(tab: any) {
        if (tab.options) {
            tab.isOptionsMenuOpen = !tab.isOptionsMenuOpen;
        }
    }

    // Close all tabs without the tab with the given id.
    CloseAllTabsOptionsMenus(id?: string) {
        this.tabs.forEach((tab: any) => {
            if (tab.id != id) {
                tab.isOptionsMenuOpen = false;
            }
        });
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
        return (this.user && this.user.uid == getCookie(this.globalService.uidCookieName));
    }

    OpenProfileEditWindow() {
        if (this.IsUserPageSelf()) {
            this.globalService.setData("openProfileEditWindow", true);
        }
    }
}