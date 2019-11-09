import { Component, OnInit, OnDestroy, Input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { GlobalService } from '../../services/global/global.service';
import { ImageService } from '../../services/global/image.service';
import { SocketService } from '../../services/global/socket.service';
import { CookieService } from '../../services/global/cookie.service';
import { EventService, EVENT_TYPE } from '../../services/global/event.service';
import { AlertService, ALERT_TYPE } from '../../services/global/alert.service';
import { SnackbarService } from '../../services/global/snackbar.service';
import { AuthService } from '../../services/global/auth.service';
import { NavbarService } from '../../services/navbar.service';
import { LoginService } from '../../services/welcome/login.service';
import { SOCKET_STATE } from '../../enums/enums';

export class Friend {
    _id: string;
    firstName: string;
    lastName: string;
    profileImage: string;
    isOnline: boolean;
    isTyping: boolean;
    typingTimer: any;
}

export enum TOOLBAR_ID {
    MESSAGES,
    FRIEND_REQUESTS
}

class ToolbarItem {
    id: TOOLBAR_ID;
    icon: string;
    title: string;
    content: Object;
    getNotificationsNumber: Function;
    isShowToolbarItemBadget: Function;
    onClick: Function;

    constructor(id: TOOLBAR_ID, icon: string, title: string, content: Object,
        getNotificationsNumber: Function, isShowToolbarItemBadget: Function, onClick: Function) {
        this.id = id;
        this.icon = icon;
        this.title = title;
        this.content = content;
        this.getNotificationsNumber = getNotificationsNumber;
        this.isShowToolbarItemBadget = isShowToolbarItemBadget;
        this.onClick = onClick;
    }
}

declare let $: any;

@Component({
    selector: 'navbar',
    templateUrl: './navbar.html',
    providers: [NavbarService, LoginService],
    styleUrls: ['./navbar.css']
})

export class NavbarComponent implements OnInit, OnDestroy {
    @Input() user: any;
    friends: Array<Friend> = [];
    chatData: any = { "isOpen": false };
    isOpenProfileEditWindow: boolean;
    isNavbarUnder: boolean = false;
    messageNotificationFriendId: string;
    isChatsWindowOpen: boolean = false;
    isFriendRequestsWindowOpen: boolean = false;
    isShowSidenav: boolean = false;
    isHideNotificationsBudget: boolean = false;
    isShowDropMenu: boolean = false;
    checkSocketConnectInterval: any;
    checkOnlineFriendsInterval: any;

    TOOLBAR_ID: any = TOOLBAR_ID;
    toolbarItems: Array<ToolbarItem>;

    //#region config variables

    notificationDelay: number = 3800; // milliseconds
    checkSocketConnectDelay: number = 10; // seconds
    checkOnlineFriendsDelay: number = 20; // seconds
    chatTypingDelay: number = 1200; // milliseconds

    //#endregion

    eventsIds: Array<string> = [];

    constructor(private router: Router,
        private authService: AuthService,
        private globalService: GlobalService,
        public imageService: ImageService,
        private socketService: SocketService,
        private cookieService: CookieService,
        private eventService: EventService,
        public alertService: AlertService,
        public snackbarService: SnackbarService,
        private loginService: LoginService,
        private navbarService: NavbarService) {

        let self = this;

        //#region events

        eventService.register(EVENT_TYPE.showProfileEditWindow, (isShow: boolean) => {
            isShow && this.closePopups();
            self.isOpenProfileEditWindow = isShow;
        }, self.eventsIds);

        eventService.register(EVENT_TYPE.hideSidenav, () => {
            self.hideSidenav();
        }, self.eventsIds);

        eventService.register(EVENT_TYPE.closeDropMenu, () => {
            this.hideDropMenu();
        }, self.eventsIds);

        eventService.register(EVENT_TYPE.openNewWindow, () => {
            self.openNewWindow();
        }, self.eventsIds);

        eventService.register(EVENT_TYPE.openChat, (friend: any) => {
            self.openChat(friend);
        }, self.eventsIds);

        eventService.register(EVENT_TYPE.addFriendRequest, (friendId: string) => {
            self.addFriendRequest(friendId);
        }, self.eventsIds);

        eventService.register(EVENT_TYPE.removeFriendRequest, (friendId: string) => {
            self.removeFriendRequest(friendId);
        }, self.eventsIds);

        eventService.register(EVENT_TYPE.addFriend, (friendId: string) => {
            self.addFriend(friendId);
        }, self.eventsIds);

        eventService.register(EVENT_TYPE.ignoreFriendRequest, (friendId: string) => {
            self.ignoreFriendRequest(friendId);
        }, self.eventsIds);

        //#endregion

        self.toolbarItems = [
            new ToolbarItem(TOOLBAR_ID.MESSAGES, "far fa-comment-dots", "הודעות",
                {},
                function () {
                    return Object.keys(this.content).reduce((acc, id) => {
                        return acc + this.content[id].unreadMessagesNumber;
                    }, 0);
                },
                function () {
                    return (this.getNotificationsNumber() > 0);
                },
                function () {
                    self.eventService.Emit(EVENT_TYPE.showHideChatsWindow);
                }),
            new ToolbarItem(TOOLBAR_ID.FRIEND_REQUESTS, "fas fa-user-friends fa-sm", "בקשות חברות",
                {
                    get: [],
                    send: [],
                    accept: []
                },
                function () {
                    return this.content.get.length + this.content.accept.length;
                },
                function () {
                    return (this.getNotificationsNumber() > 0);
                },
                function () {
                    self.eventService.Emit(EVENT_TYPE.showHideFriendRequestsWindow);
                })
        ];
    }

    ngOnInit() {
        this.socketService.SocketEmit('login');

        let self = this;

        self.checkSocketConnectInterval = setInterval(() => {
            self.authService.IsUserSocketConnect().then((result: any) => {
                if (result) {
                    switch (result.state) {
                        case SOCKET_STATE.ACTIVE:
                            break;
                        // In case the user is login with no connected socket.
                        case SOCKET_STATE.CLOSE:
                            self.socketService.RefreshSocket();
                            break;
                        // In case the user is logout.
                        case SOCKET_STATE.LOGOUT:
                            self.logout();
                            self.navigateToLogin();
                            break;
                    }
                }
            });
        }, self.checkSocketConnectDelay * 1000);

        self.checkOnlineFriendsInterval = setInterval(() => {
            self.socketService.SocketEmit("ServerGetOnlineFriends");
        }, self.checkOnlineFriendsDelay * 1000);

        // Loading user messages notifications.
        self.navbarService.GetUserMessagesNotifications().then((result: any) => {
            self.getToolbarItem(TOOLBAR_ID.MESSAGES).content = result.messagesNotifications || {};
        });

        // Loading user friend requests.
        self.navbarService.GetUserFriendRequests().then((result: any) => {
            self.getToolbarItem(TOOLBAR_ID.FRIEND_REQUESTS).content = result.friendRequests;
        });

        self.socketService.SocketOn('LogoutUserSessionClient', (msg: string) => {
            self.logout();
            self.alertService.Alert({
                title: "התנתקות מהמערכת",
                text: msg,
                showCancelButton: false,
                type: ALERT_TYPE.INFO,
                finalFunc: () => {
                    self.navigateToLogin();
                }
            });
        });

        self.socketService.SocketOn('GetMessage', (msgData: any) => {
            if (!self.chatData.isOpen || msgData.from != self.chatData.friend._id) {
                self.addMessageToToolbarMessages(msgData);

                if (!self.chatData.isOpen) {
                    self.showMessageNotification(self.getFriendNameById(msgData.from),
                        msgData.text,
                        msgData.isImage,
                        msgData.from);
                    self.isHideNotificationsBudget = false;
                }
            }
        });

        self.socketService.SocketOn('ClientGetOnlineFriends', (onlineFriendsIds: Array<string>) => {
            // In case one or more friends are connected. 
            if (onlineFriendsIds.length > 0) {
                self.friends.forEach(friend => {
                    friend.isOnline = onlineFriendsIds.includes(friend._id);
                });
            }
            else {
                self.friends.forEach(friend => {
                    friend.isOnline = false;
                });
            }
        });

        self.socketService.SocketOn('UpdateFriendConnectionStatus', (statusObj: any) => {
            let friend = self.friends.find(friend => {
                return (friend._id == statusObj.friendId);
            });

            friend && (friend.isOnline = statusObj.isOnline);
        });

        self.socketService.SocketOn('ClientUpdateFriendRequests', (friendRequests: Array<any>) => {
            self.getToolbarItem(TOOLBAR_ID.FRIEND_REQUESTS).content = friendRequests;
        });

        self.socketService.SocketOn('GetFriendRequest', (friendId: string, friendFullName: string) => {
            let friendRequests: any = self.getToolbarItem(TOOLBAR_ID.FRIEND_REQUESTS).content;
            friendRequests.get.push(friendId);
            self.showFriendRequestNotification(friendFullName, false);
            self.isHideNotificationsBudget = false;
        });

        self.socketService.SocketOn('DeleteFriendRequest', (friendId: string) => {
            let friendRequests: any = self.getToolbarItem(TOOLBAR_ID.FRIEND_REQUESTS).content;
            friendRequests.get.splice(friendRequests.get.indexOf(friendId), 1);
            self.eventService.Emit(EVENT_TYPE.removeUserFromNavbarSearchCache, friendId);
        });

        self.socketService.SocketOn('ClientIgnoreFriendRequest', (friendId: string) => {
            let friendRequests: any = self.getToolbarItem(TOOLBAR_ID.FRIEND_REQUESTS).content;
            friendRequests.send.splice(friendRequests.send.indexOf(friendId), 1);
        });

        self.socketService.SocketOn('ClientAddFriend', (friend: any) => {
            self.addFriendObjectToUser(friend);
        });

        self.socketService.SocketOn('ClientFriendAddedUpdate', (friend: any) => {
            self.authService.SetCurrUserToken().then((result: any) => {
                if (result) {
                    self.socketService.RefreshSocket();
                    self.socketService.SocketEmit("ServerGetOnlineFriends");
                }
            });

            let friendRequests: any = self.getToolbarItem(TOOLBAR_ID.FRIEND_REQUESTS).content;

            // Remove friend id from send array and push it to the friends array.
            friendRequests.send.splice(friendRequests.send.indexOf(friend._id), 1);
            self.user.friends.push(friend._id);
            self.friends.push(friend);

            // Add the friend id to the confirmed requests array and show notifications.
            self.getToolbarItem(TOOLBAR_ID.FRIEND_REQUESTS).content.accept.push(friend._id);
            self.isHideNotificationsBudget = false;
            self.showFriendRequestNotification(friend.firstName + " " + friend.lastName, true);

            self.socketService.SocketEmit("ServerUpdateFriendRequests", friendRequests);
            self.socketService.SocketEmit("removeFriendRequest", self.user._id, friend._id);
            self.socketService.SocketEmit("ServerGetOnlineFriends");
        });

        self.socketService.SocketOn('ClientFriendTyping', (friendId: string) => {
            self.makeFriendTyping(friendId);
        });

        self.socketService.SocketOn('ClientRemoveFriendUser', (friendId: string, userName: string) => {
            self.removeFriend(friendId);

            self.alertService.Alert({
                title: "מחיקת משתמש מהאתר",
                text: "החשבון של " + "<b>" + userName + "</b>" + " נמחק מהאתר לצמיתות.",
                showCancelButton: false,
                type: ALERT_TYPE.INFO
            });
        });

        self.socketService.SocketOn('ClientRemoveFriend', (friendId: string) => {
            self.authService.SetCurrUserToken().then((result: any) => {
                result && self.socketService.RefreshSocket();
            });

            self.removeFriend(friendId);
        });
    }

    ngOnDestroy() {
        this.eventService.UnsubscribeEvents(this.eventsIds);
        clearInterval(this.checkSocketConnectInterval);
        clearInterval(this.checkOnlineFriendsInterval);
    }

    addMessageToToolbarMessages(msgData: any) {
        let notificationsMessages = this.getToolbarItem(TOOLBAR_ID.MESSAGES).content;
        let friendMessages = notificationsMessages[msgData.from];

        if (friendMessages) {
            friendMessages.unreadMessagesNumber++;
        }
        else {
            notificationsMessages[msgData.from] = {
                "unreadMessagesNumber": 1,
                "firstUnreadMessageId": msgData.id
            };
        }

        this.navbarService.UpdateMessagesNotifications(notificationsMessages);
    }

    removeFriendMessagesFromToolbarMessages(friendId: string) {
        let notificationsMessages = this.getToolbarItem(TOOLBAR_ID.MESSAGES).content;

        if (notificationsMessages[friendId]) {
            delete (notificationsMessages[friendId]);
            this.navbarService.RemoveMessagesNotifications(notificationsMessages);
        }
    }

    // Return item object from toolbar items array by its id.
    getToolbarItem(id: TOOLBAR_ID): any {
        return this.toolbarItems.find(item => {
            return (item.id == id);
        });
    }

    showMessageNotification(name: string, text: string, isImage: boolean, friendId: string) {
        this.messageNotificationFriendId = friendId;
        let notificationText = name + ": " + (isImage ? "שלח/ה לך תמונה" : text);
        this.snackbarService.Snackbar(notificationText,
            this.notificationDelay,
            this.messageNotificationClicked.bind(this));
    }

    getFriendNameById(id: string): string {
        let friend: Friend = this.getFriendById(id);

        return friend ? (friend.firstName + " " + friend.lastName) : null;
    }

    getFriendById(id: string): Friend {
        return this.friends.find(friend => {
            return (friend._id == id);
        });
    }

    messageNotificationClicked() {
        let friendId = this.getFriendById(this.messageNotificationFriendId);
        this.openChat(friendId);
    }

    hideSidenav() {
        if (this.isShowSidenav) {
            this.isHideNotificationsBudget = true;
            this.hideChatsWindow();
            this.hideFriendRequestsWindow();
            this.isShowSidenav = false;
            $("#sidenav").width("0px");
            $("body").removeClass("no-overflow");
        }
    }

    hideDropMenu() {
        this.isShowDropMenu = false;
    }

    closePopups() {
        this.hideSidenav();
        this.hideDropMenu();
        this.eventService.Emit(EVENT_TYPE.hideSearchResults);
    }

    overlayClicked() {
        if (this.isChatsWindowOpen || this.isFriendRequestsWindowOpen) {
            this.hideChatsWindow();
            this.hideFriendRequestsWindow();
        }
        else {
            this.closePopups();
        }
    }

    openChat(friend: any) {
        this.snackbarService.HideSnackbar();
        this.hideSidenav();

        if (!this.chatData.isOpen || !this.chatData.friend || this.chatData.friend._id != friend._id) {
            let messagesNotifications = Object.assign({}, this.getToolbarItem(TOOLBAR_ID.MESSAGES).content);

            // Empty unread messages notifications from the currend friend.
            this.removeFriendMessagesFromToolbarMessages(friend._id);

            // Put default profile in case the friend has no profile image.
            if (!friend.profileImage) {
                friend.profileImage = this.imageService.defaultProfileImage;
            }

            this.chatData.friend = friend;
            this.chatData.user = this.user;
            this.chatData.messagesNotifications = messagesNotifications;
            this.chatData.isOpen = true;

            this.eventService.Emit(EVENT_TYPE.setChatData, this.chatData);
        }
        else {
            this.eventService.Emit(EVENT_TYPE.moveToChatWindow, true);
        }
    }

    hideChatsWindow() {
        this.isChatsWindowOpen = false;
    }

    hideFriendRequestsWindow() {
        this.isFriendRequestsWindowOpen = false;
    }

    addFriendRequest(friendId: string) {
        let friendRequests: any = this.getToolbarItem(TOOLBAR_ID.FRIEND_REQUESTS).content;
        friendRequests.send.push(friendId);

        let self = this;
        self.navbarService.addFriendRequest(friendId).then((result: any) => {
            if (result) {
                self.socketService.SocketEmit("ServerUpdateFriendRequests", friendRequests);
                self.socketService.SocketEmit("SendFriendRequest", friendId);
                self.eventService.Emit(EVENT_TYPE.sendFriendRequest, friendId);
                self.snackbarService.Snackbar("נשלחה בקשת חברות");
            }
        });
    }

    removeFriendRequest(friendId: string, isHideMessageText?: boolean) {
        let friendRequests: any = this.getToolbarItem(TOOLBAR_ID.FRIEND_REQUESTS).content;
        friendRequests.send.splice(friendRequests.send.indexOf(friendId), 1);

        let self = this;
        self.navbarService.removeFriendRequest(friendId).then((result: any) => {
            if (result) {
                self.socketService.SocketEmit("ServerUpdateFriendRequests", friendRequests);
                self.socketService.SocketEmit("removeFriendRequest", self.user._id, friendId);
                self.snackbarService.Snackbar("בקשת החברות בוטלה");
            }
        });
    }

    ignoreFriendRequest(friendId: string, callback?: Function) {
        // Remove the friend request from all friend requests object.
        let friendRequests: any = this.getToolbarItem(TOOLBAR_ID.FRIEND_REQUESTS).content;
        friendRequests.get.splice(friendRequests.get.indexOf(friendId), 1);

        let self = this;
        self.navbarService.ignoreFriendRequest(friendId).then((result: any) => {
            if (result) {
                self.socketService.SocketEmit("ServerUpdateFriendRequests", friendRequests);
                self.socketService.SocketEmit("ServerIgnoreFriendRequest", self.user._id, friendId);
                self.socketService.SocketEmit("ServerUpdateFriendRequestsStatus", friendId);
            }

            callback && callback(result);
        });
    }

    showFriendRequestNotification(name: string, isConfirm: boolean) {
        let notificationText = name + " " +
            (isConfirm ? "אישר/ה את בקשת החברות" : "שלח/ה לך בקשת חברות");
        this.snackbarService.Snackbar(notificationText, this.notificationDelay);
    }

    addFriendObjectToUser(friend: any) {
        let userFriends = this.user.friends;

        if (!userFriends.includes(friend._id)) {
            // Add the friend id to the user's friends array.
            userFriends.push(friend._id);

            // Add the friend client object to the friends array.
            this.friends.push(friend);
        }

        this.socketService.SocketEmit("ServerGetOnlineFriends");
    }

    addFriend(friendId: string, callback?: Function) {
        this.eventService.Emit(EVENT_TYPE.setUserFriendsLoading, true);

        // Remove the friend request from all friend requests object.
        let friendRequests: any = this.getToolbarItem(TOOLBAR_ID.FRIEND_REQUESTS).content;
        friendRequests.get.splice(friendRequests.get.indexOf(friendId), 1);

        let self = this;

        self.navbarService.addFriend(friendId).then((friend: any) => {
            self.eventService.Emit(EVENT_TYPE.setUserFriendsLoading, false);

            if (friend) {
                self.socketService.RefreshSocket();
                self.socketService.SocketEmit("ServerUpdateFriendRequests", friendRequests);
                self.socketService.SocketEmit("ServerAddFriend", friend);
                self.socketService.SocketEmit("ServerFriendAddedUpdate", friend._id);
                self.socketService.SocketEmit("ServerUpdateFriendRequestsStatus", friendId);
                self.addFriendObjectToUser(friend);
            }
            else {
                //  Recover the actions in case the server is fail to add the friend. 
                friendRequests.get.push(friendId);
                self.socketService.SocketEmit("ServerUpdateFriendRequests", friendRequests);
            }

            callback && callback(friend);
        });
    }

    makeFriendTyping(friendId: string) {
        let friendObj: Friend = this.friends.find((friend: Friend) => {
            return (friend._id == friendId);
        });

        if (friendObj) {
            friendObj.typingTimer && clearTimeout(friendObj.typingTimer);
            friendObj.isTyping = true;

            let self = this;

            friendObj.typingTimer = setTimeout(() => {
                friendObj.isTyping = false;
            }, self.chatTypingDelay);
        }
    }

    closeChatWindow() {
        this.chatData.isOpen = false;
    }

    openNewWindow() {
        this.closePopups();
        this.closeChatWindow();
    }

    removeFriend(friendId: string) {
        // ---------- Remove friend notifications on friend requests window ----------
        let friendRequests = this.getToolbarItem(TOOLBAR_ID.FRIEND_REQUESTS).content;

        let friendRequestGetIndex = friendRequests.get.indexOf(friendId);
        let friendRequestSendIndex = friendRequests.send.indexOf(friendId);
        let friendRequestAcceptIndex = friendRequests.accept.indexOf(friendId);

        if (friendRequestGetIndex != -1) {
            friendRequests.get.splice(friendRequestGetIndex, 1);
        }

        if (friendRequestSendIndex != -1) {
            friendRequests.send.splice(friendRequestSendIndex, 1);
        }

        if (friendRequestAcceptIndex != -1) {
            friendRequests.accept.splice(friendRequestAcceptIndex, 1);
        }

        // ---------------------------------------------------------------------------

        // In case chat is open with the friend.
        if (this.chatData.isOpen && this.chatData.friend._id == friendId) {
            this.closeChatWindow();
        }

        // Remove friend messages notifications
        delete this.getToolbarItem(TOOLBAR_ID.MESSAGES).content[friendId];

        // Removing friend from user friends ids list.
        for (let i = 0; i < this.user.friends.length; i++) {
            if (this.user.friends[i] == friendId) {
                this.user.friends.splice(i, 1);
                break;
            }
        }

        // Removing friend from user friends objects list.
        for (let i = 0; i < this.friends.length; i++) {
            if (this.friends[i]._id == friendId) {
                this.friends.splice(i, 1);
                break;
            }
        }
    }

    getResultsIds(results: Array<any>) {
        let profilesIds: Array<string> = [];

        results.forEach((result: any) => {
            let id: string = result.originalProfile;
            id && profilesIds.push(id);
        });

        return profilesIds;
    }

    navigateToLogin() {
        this.router.navigateByUrl("/login");
    }

    logout() {
        this.cookieService.DeleteUidCookie();
        this.loginService.DeleteTokenFromCookie();
        this.globalService.ResetGlobalVariables();
    }
}