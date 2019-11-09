import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { GlobalService } from '../../services/global/global.service';
import { ImageService } from 'src/app/services/global/image.service';
import { SocketService } from '../../services/global/socket.service';
import { EventService, EVENT_TYPE } from '../../services/global/event.service';
import { AlertService, ALERT_TYPE } from '../../services/global/alert.service';
import { UserPageService } from '../../services/userPage/userPage.service';
import { SnackbarService } from '../../services/global/snackbar.service';

export enum FRIEND_STATUS {
    IS_FRIEND = "isFriend",
    IS_GET_FRIEND_REQUEST = "isGetFriendRequest",
    IS_SEND_FRIEND_REQUEST = "isSendFriendRequest"
}

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

    eventsIds: Array<string> = [];

    constructor(private router: Router,
        private route: ActivatedRoute,
        private userPageService: UserPageService,
        public alertService: AlertService,
        public snackbarService: SnackbarService,
        private globalService: GlobalService,
        public imageService: ImageService,
        private socketService: SocketService,
        private eventService: EventService) {
        let self = this;

        //#region events

        eventService.register(EVENT_TYPE.newUploadedImage, (img: string) => {
            self.user.profileImage = self.user.profileImage || null;
            self.user.profileImage = img;
        }, self.eventsIds);

        eventService.register(EVENT_TYPE.deleteProfileImage, () => {
            self.user.profileImage = null;
        }, self.eventsIds);

        eventService.register(EVENT_TYPE.closeUserEditWindow, () => {
            self.isShowUserEditWindow = false;
            self.eventService.emit(EVENT_TYPE.setNavbarTop, true);
        }, self.eventsIds);

        eventService.register(EVENT_TYPE.closeUserReportWindow, () => {
            self.isShowUserReportWindow = false;
            self.eventService.emit(EVENT_TYPE.setNavbarTop, true);
        }, self.eventsIds);

        eventService.register(EVENT_TYPE.closeUserPasswordWindow, () => {
            self.isShowUserPasswordWindow = false;
            self.eventService.emit(EVENT_TYPE.setNavbarTop, true);
        }, self.eventsIds);

        eventService.register(EVENT_TYPE.closeUserPrivacyWindow, () => {
            self.isShowUserPrivacyWindow = false;
            self.eventService.emit(EVENT_TYPE.setNavbarTop, true);
        }, self.eventsIds);

        eventService.register(EVENT_TYPE.ignoreFriendRequest, (userId: string) => {
            if (userId == self.user._id) {
                self.unsetUserFriendStatus(FRIEND_STATUS.IS_SEND_FRIEND_REQUEST);
            }
        }, self.eventsIds);

        //#endregion

        self.socketService.socketOn('DeleteFriendRequest', (friendId: string) => {
            if (friendId == self.user._id) {
                self.unsetUserFriendStatus(FRIEND_STATUS.IS_SEND_FRIEND_REQUEST);
            }
        });

        self.tabs = [
            {
                id: "edit",
                icon: "fas fa-user-edit",
                innerIconText: '',
                title: "עדכון פרטים",
                isShow: function () {
                    return self.isUserPageSelf();
                },
                onClick: function () {
                    self.openUserWindow("isShowUserEditWindow");
                }
            },
            {
                id: "friendOptions",
                icon: "fas fa-user-check",
                innerIconText: '',
                title: "אפשרויות חברות",
                isShow: function () {
                    return self.user.isFriend;
                },
                options: [
                    {
                        text: "הסרת חברות",
                        action: function () {
                            self.alertService.alert({
                                title: "הסרת חברות",
                                text: "האם להסיר את החברות עם " + self.user.fullName + "?",
                                type: ALERT_TYPE.WARNING,
                                confirmFunc: function () {
                                    self.userPageService.removeFriends(self.user._id).then(result => {
                                        if (result) {
                                            self.socketService.socketEmit("ServerRemoveFriend", self.user._id);
                                            self.unsetUserFriendStatus(FRIEND_STATUS.IS_FRIEND);
                                            self.snackbarService.snackbar("הסרת החברות עם " + self.user.fullName + " בוצעה בהצלחה");
                                            self.socketService.refreshSocket();
                                        }
                                        else {
                                            self.alertService.alert({
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
                            self.openUserWindow("isShowUserReportWindow");
                        }
                    }
                ]
            },
            {
                id: "addFriendRequest",
                icon: "fas fa-user-plus",
                innerIconText: '',
                title: "בקשת חברות",
                isShow: function () {
                    return (!self.user.isFriend &&
                        !self.user.isGetFriendRequest &&
                        !self.user.isSendFriendRequest &&
                        !self.isUserPageSelf());
                },
                onClick: function () {
                    self.setUserFriendStatus(FRIEND_STATUS.IS_GET_FRIEND_REQUEST);
                    self.eventService.emit(EVENT_TYPE.addFriendRequest, self.user._id);
                }
            },
            {
                id: "friendRequestOptions",
                icon: "fas fa-user-friends",
                innerIconText: '',
                title: "בקשת חברות",
                isShow: function () {
                    return self.user.isSendFriendRequest;
                },
                options: [
                    {
                        text: "אישור חברות",
                        action: function () {
                            self.setUserFriendStatus(FRIEND_STATUS.IS_FRIEND);
                            self.eventService.emit(EVENT_TYPE.addFriend, self.user._id);
                        }
                    },
                    {
                        text: "דחיית חברות",
                        action: function () {
                            self.unsetUserFriendStatus(FRIEND_STATUS.IS_SEND_FRIEND_REQUEST);
                            self.eventService.emit(EVENT_TYPE.ignoreFriendRequest, self.user._id);
                        }
                    }
                ]
            },
            {
                id: "removeFriendRequest",
                icon: "fas fa-user-times",
                innerIconText: '',
                title: "ביטול בקשת חברות",
                isShow: function () {
                    return self.user.isGetFriendRequest;
                },
                onClick: function () {
                    self.unsetUserFriendStatus(FRIEND_STATUS.IS_GET_FRIEND_REQUEST);
                    self.eventService.emit(EVENT_TYPE.removeFriendRequest, self.user._id);
                }
            },
            {
                id: "openChat",
                icon: "far fa-edit",
                innerIconText: '',
                title: "צ'אט",
                isShow: function () {
                    return self.user.isFriend;
                },
                onClick: function () {
                    self.eventService.emit(EVENT_TYPE.openChat, self.user);
                }
            },
            {
                id: "menu",
                icon: "fas fa-bars",
                innerIconText: '',
                title: "עוד",
                onClick: function () {

                },
                isShow: function () {
                    return self.isUserPageSelf();
                },
                options: [
                    {
                        text: "שינוי סיסמא",
                        action: function () {
                            self.openUserWindow("isShowUserPasswordWindow");
                        }
                    },
                    {
                        text: "הגדרות פרטיות",
                        action: function () {
                            self.openUserWindow("isShowUserPrivacyWindow");
                        }
                    },
                    {
                        text: "מחיקת משתמש",
                        action: function () {
                            self.alertService.alert({
                                title: "מחיקת המשתמש באתר לצמיתות",
                                text: "משמעות פעולה זו היא מחיקת חשבונך באתר. \n" +
                                    "הפעולה תוביל למחיקת כל הנתונים בחשבון לרבות: \n" +
                                    "מידע אישי, שיחות, תמונות, וכל מידע אחר שהועלה על ידך לאתר.\n" +
                                    "יש לשים לב כי פעולה זו היא בלתי הפיכה ואינה ניתנת לשחזור!\n\n" +
                                    "<b>האם למחוק את המשתמש שלך מהאתר?</b>",
                                type: ALERT_TYPE.DANGER,
                                confirmFunc: function () {
                                    self.userPageService.deleteUserValidation().then(result => {
                                        result && self.alertService.alert({
                                            title: "מחיקת משתמש",
                                            text: "לאישור המחיקה, יש להיכנס לקישור שנשלח לכתובת האימייל שלך.",
                                            type: ALERT_TYPE.INFO,
                                            showCancelButton: false
                                        });
                                    });
                                }
                            });
                        }
                    }
                ]
            },
            {
                id: "manage",
                icon: "fas fa-cog",
                innerIconText: '',
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

            // close chat window in case it is open.
            this.eventService.emit(EVENT_TYPE.closeChat, true);

            // Get user details by user id route parameter.
            this.userPageService.getUserDetails(params["id"]).then((user: any) => {
                // In case the user was found.
                if (user) {
                    user.fullName = user.firstName + " " + user.lastName;
                    this.initializePage(user);
                }
                else {
                    this.router.navigateByUrl('/page-not-found');
                }
            });
        });

        let self = this;

        self.socketService.socketOn('ClientAddFriend', function (friend: any) {
            if (friend._id == self.user._id) {
                self.setUserFriendStatus(FRIEND_STATUS.IS_FRIEND);
            }
        });

        self.socketService.socketOn('ClientFriendAddedUpdate', function (friend: any) {
            if (friend._id == self.user._id) {
                self.setUserFriendStatus(FRIEND_STATUS.IS_FRIEND);
            }
        });

        self.socketService.socketOn('ClientRemoveFriend', function (friendId: string) {
            if (friendId == self.user._id) {
                self.unsetUserFriendStatus(FRIEND_STATUS.IS_FRIEND);
            }
        });

        self.socketService.socketOn('ClientIgnoreFriendRequest', function (friendId: string) {
            if (friendId == self.user._id) {
                self.unsetUserFriendStatus(FRIEND_STATUS.IS_GET_FRIEND_REQUEST);
            }
        });

        self.socketService.socketOn('GetFriendRequest', function (friendId: string) {
            if (friendId == self.user._id) {
                self.setUserFriendStatus(FRIEND_STATUS.IS_SEND_FRIEND_REQUEST);
            }
        });

        // In case the user has been removed from the site.
        self.socketService.socketOn('ClientRemoveFriendUser', function (friendId: string) {
            if (friendId == self.user._id) {
                self.router.navigateByUrl("/");
            }
        });

        // In case the user set private user.
        self.socketService.socketOn('UserSetToPrivate', function (userId: string) {
            if (!self.isUserPageSelf() &&
                !self.user.isFriend &&
                !self.user.isSendFriendRequest) {
                self.router.navigateByUrl("/");
            }
        });
    }

    ngOnDestroy() {
        this.eventService.unsubscribeEvents(this.eventsIds);
    }

    openUserWindow(windowShowPropertyName: string) {
        this.eventService.emit(EVENT_TYPE.setNavbarUnder, true);
        this.eventService.emit(EVENT_TYPE.closeChat, true);
        this[windowShowPropertyName] = true;
    }

    changeTabOptionsMenuState(tab: any) {
        this.closeAllTabsOptionsMenus(tab.id);

        if (tab.options) {
            tab.isOptionsMenuOpen = !tab.isOptionsMenuOpen;
            this.isOverlay = tab.isOptionsMenuOpen;
        }
    }

    // close all tabs without the tab with the given id.
    closeAllTabsOptionsMenus(id?: string) {
        this.tabs.forEach((tab: any) => {
            if (tab.id != id) {
                tab.isOptionsMenuOpen = false;
            }
        });

        this.isOverlay = false;
    }

    initializePage(user: any) {
        this.closeAllTabsOptionsMenus();
        this.eventService.emit(EVENT_TYPE.changeSearchInput, user.firstName + " " + user.lastName);
        this.user = user;
    }

    unsetUserFriendStatus(status: FRIEND_STATUS) {
        // Set the requested field to true.
        this.user[status] = false;
    }

    setUserFriendStatus(status: FRIEND_STATUS) {
        this.user.isFriend = false;
        this.user.isGetFriendRequest = false;
        this.user.isSendFriendRequest = false;

        // Set the requested field to true.
        this.user[status] = true;
    }

    getTabs() {
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
    isUserPageSelf() {
        return (this.user && this.user._id == this.globalService.userId);
    }

    openProfileEditWindow() {
        this.closeAllTabsOptionsMenus();

        if (this.isUserPageSelf()) {
            this.eventService.emit(EVENT_TYPE.openProfileEditWindow, true);
        }
    }

    closeTabOptions(tab: any) {
        tab.isOptionsMenuOpen = false;
        this.isOverlay = tab.isOptionsMenuOpen;
    }
}