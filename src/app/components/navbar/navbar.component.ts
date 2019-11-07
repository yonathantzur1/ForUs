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
    isFriendsLoading: boolean = false;
    chatData: any = { "isOpen": false };
    isOpenProfileEditWindow: boolean;
    isNavbarUnder: boolean = false;

    // START message notification variables //

    isShowMessageNotification: boolean = false;
    messageNotificationName: string;
    messageNotificationText: string;
    isMessageNotificationImage: boolean;
    messageNotificationFriendId: string;
    messageNotificationInterval: any;

    // END message notification variables //

    // START friend-request notification variables //

    isShowFriendRequestNotification: boolean = false;
    isShowFriendConfirmNotification: boolean = false;
    friendRequestNotificationName: string;
    friendRequestNotificationInterval: any;

    // END friend-request notification variables //

    isChatsWindowOpen: boolean = false;
    isFriendRequestsWindowOpen: boolean = false;
    isShowSidenav: boolean = false;
    isHideNotificationsBudget: boolean = false;
    isShowDropMenu: boolean = false;
    checkSocketConnectInterval: any;
    checkOnlineFriendsInterval: any;

    TOOLBAR_ID: any = TOOLBAR_ID;
    toolbarItems: Array<ToolbarItem>;

    // START CONFIG VARIABLES //

    notificationDelay: number = 3800; // milliseconds
    checkSocketConnectDelay: number = 10; // seconds
    checkOnlineFriendsDelay: number = 20; // seconds
    chatTypingDelay: number = 1200; // milliseconds

    // END CONFIG VARIABLES //

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

        eventService.Register(EVENT_TYPE.showProfileEditWindow, (isShow: boolean) => {
            isShow && this.ClosePopups();
            self.isOpenProfileEditWindow = isShow;
        }, self.eventsIds);

        eventService.Register(EVENT_TYPE.hideSidenav, () => {
            self.HideSidenav();
        }, self.eventsIds);

        eventService.Register(EVENT_TYPE.closeDropMenu, () => {
            this.HideDropMenu();
        }, self.eventsIds);

        eventService.Register(EVENT_TYPE.openNewWindow, () => {
            self.OpenNewWindow();
        }, self.eventsIds);

        eventService.Register(EVENT_TYPE.openChat, (friend: any) => {
            self.OpenChat(friend);
        }, self.eventsIds);

        eventService.Register(EVENT_TYPE.addFriendRequest, (friendId: string) => {
            self.AddFriendRequest(friendId);
        }, self.eventsIds);

        eventService.Register(EVENT_TYPE.removeFriendRequest, (friendId: string) => {
            self.RemoveFriendRequest(friendId);
        }, self.eventsIds);

        eventService.Register(EVENT_TYPE.addFriend, (friendId: string) => {
            self.AddFriend(friendId);
        }, self.eventsIds);

        eventService.Register(EVENT_TYPE.ignoreFriendRequest, (friendId: string) => {
            self.IgnoreFriendRequest(friendId);
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
                            self.Logout();
                            self.NavigateToLogin();
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
            self.GetToolbarItem(TOOLBAR_ID.MESSAGES).content = result.messagesNotifications || {};
        });

        // Loading user friend requests.
        self.navbarService.GetUserFriendRequests().then((result: any) => {
            self.GetToolbarItem(TOOLBAR_ID.FRIEND_REQUESTS).content = result.friendRequests;
        });

        self.socketService.SocketOn('LogoutUserSessionClient', (msg: string) => {
            self.Logout();
            self.alertService.Alert({
                title: "התנתקות מהמערכת",
                text: msg,
                showCancelButton: false,
                type: ALERT_TYPE.INFO,
                finalFunc: () => {
                    self.NavigateToLogin();
                }
            });
        });

        self.socketService.SocketOn('GetMessage', (msgData: any) => {
            if (!self.chatData.isOpen || msgData.from != self.chatData.friend._id) {
                self.AddMessageToToolbarMessages(msgData);

                if (!self.chatData.isOpen) {
                    // Turn off the open notification.
                    self.isShowMessageNotification = false;

                    if (self.messageNotificationInterval) {
                        clearInterval(self.messageNotificationInterval);
                        self.messageNotificationInterval = null;
                    }

                    self.ShowMessageNotification(self.GetFriendNameById(msgData.from),
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
            self.GetToolbarItem(TOOLBAR_ID.FRIEND_REQUESTS).content = friendRequests;
        });

        self.socketService.SocketOn('GetFriendRequest', (friendId: string, friendFullName: string) => {
            let friendRequests: any = self.GetToolbarItem(TOOLBAR_ID.FRIEND_REQUESTS).content;
            friendRequests.get.push(friendId);
            self.ShowFriendRequestNotification(friendFullName, false);
            self.isHideNotificationsBudget = false;
        });

        self.socketService.SocketOn('DeleteFriendRequest', (friendId: string) => {
            let friendRequests: any = self.GetToolbarItem(TOOLBAR_ID.FRIEND_REQUESTS).content;
            friendRequests.get.splice(friendRequests.get.indexOf(friendId), 1);
            self.eventService.Emit(EVENT_TYPE.removeUserFromNavbarSearchCache, friendId);
        });

        self.socketService.SocketOn('ClientIgnoreFriendRequest', (friendId: string) => {
            let friendRequests: any = self.GetToolbarItem(TOOLBAR_ID.FRIEND_REQUESTS).content;
            friendRequests.send.splice(friendRequests.send.indexOf(friendId), 1);
        });

        self.socketService.SocketOn('ClientAddFriend', (friend: any) => {
            self.AddFriendObjectToUser(friend);
        });

        self.socketService.SocketOn('ClientFriendAddedUpdate', (friend: any) => {
            self.authService.SetCurrUserToken().then((result: any) => {
                if (result) {
                    self.socketService.RefreshSocket();
                    self.socketService.SocketEmit("ServerGetOnlineFriends");
                }
            });

            let friendRequests: any = self.GetToolbarItem(TOOLBAR_ID.FRIEND_REQUESTS).content;

            // Remove friend id from send array and push it to the friends array.
            friendRequests.send.splice(friendRequests.send.indexOf(friend._id), 1);
            self.user.friends.push(friend._id);
            self.friends.push(friend);

            // Add the friend id to the confirmed requests array and show notifications.
            self.GetToolbarItem(TOOLBAR_ID.FRIEND_REQUESTS).content.accept.push(friend._id);
            self.isHideNotificationsBudget = false;
            self.ShowFriendRequestNotification(friend.firstName + " " + friend.lastName, true);

            self.socketService.SocketEmit("ServerUpdateFriendRequests", friendRequests);
            self.socketService.SocketEmit("RemoveFriendRequest", self.user._id, friend._id);
            self.socketService.SocketEmit("ServerGetOnlineFriends");
        });

        self.socketService.SocketOn('ClientFriendTyping', (friendId: string) => {
            self.MakeFriendTyping(friendId);
        });

        self.socketService.SocketOn('ClientRemoveFriendUser', (friendId: string, userName: string) => {
            self.RemoveFriend(friendId);

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

            self.RemoveFriend(friendId);
        });
    }

    ngOnDestroy() {
        this.eventService.UnsubscribeEvents(this.eventsIds);
        clearInterval(this.checkSocketConnectInterval);
        clearInterval(this.checkOnlineFriendsInterval);
    }

    AddMessageToToolbarMessages(msgData: any) {
        let notificationsMessages = this.GetToolbarItem(TOOLBAR_ID.MESSAGES).content;
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

    RemoveFriendMessagesFromToolbarMessages(friendId: string) {
        let notificationsMessages = this.GetToolbarItem(TOOLBAR_ID.MESSAGES).content;

        if (notificationsMessages[friendId]) {
            delete (notificationsMessages[friendId]);
            this.navbarService.RemoveMessagesNotifications(notificationsMessages);
        }
    }

    // Return item object from toolbar items array by its id.
    GetToolbarItem(id: TOOLBAR_ID): any {
        return this.toolbarItems.find(item => {
            return (item.id == id);
        });
    }

    ShowMessageNotification(name: string, text: string, isImage: boolean, friendId: string) {
        if (name && text) {
            this.messageNotificationName = name;
            this.messageNotificationText = text;
            this.isMessageNotificationImage = isImage;
            this.messageNotificationFriendId = friendId;
            this.isShowMessageNotification = true;

            let self = this;
            self.messageNotificationInterval = setInterval(() => {
                self.HideMessageNotification();
            }, self.notificationDelay);
        }
    }

    HideMessageNotification() {
        this.isShowMessageNotification = false;
        clearInterval(this.messageNotificationInterval);
        this.messageNotificationInterval = null;
    }

    GetFriendNameById(id: string): string {
        let friend: Friend = this.GetFriendById(id);

        return friend ? (friend.firstName + " " + friend.lastName) : null;
    }

    GetFriendById(id: string): Friend {
        return this.friends.find(friend => {
            return (friend._id == id);
        });
    }

    MessageNotificationClicked() {
        // Turn off the open notification.
        this.isShowMessageNotification = false;

        if (this.messageNotificationInterval) {
            clearInterval(this.messageNotificationInterval);
            this.messageNotificationInterval = null;
        }

        this.OpenChat(this.GetFriendById(this.messageNotificationFriendId));
    }

    HideSidenav() {
        if (this.isShowSidenav) {
            this.isHideNotificationsBudget = true;
            this.HideChatsWindow();
            this.HideFriendRequestsWindow();
            this.isShowSidenav = false;
            $("#sidenav").width("0px");
            $("body").removeClass("no-overflow");
        }
    }

    HideDropMenu() {
        this.isShowDropMenu = false;
    }

    ClosePopups() {
        this.HideSidenav();
        this.HideDropMenu();
        this.eventService.Emit(EVENT_TYPE.hideSearchResults);
    }

    OverlayClicked() {
        if (this.isChatsWindowOpen || this.isFriendRequestsWindowOpen) {
            this.HideChatsWindow();
            this.HideFriendRequestsWindow();
        }
        else {
            this.ClosePopups();
        }
    }

    OpenChat(friend: any) {
        this.HideMessageNotification();
        this.HideSidenav();

        if (!this.chatData.isOpen || !this.chatData.friend || this.chatData.friend._id != friend._id) {
            let messagesNotifications = Object.assign({}, this.GetToolbarItem(TOOLBAR_ID.MESSAGES).content);

            // Empty unread messages notifications from the currend friend.
            this.RemoveFriendMessagesFromToolbarMessages(friend._id);

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

    HideChatsWindow() {
        this.isChatsWindowOpen = false;
    }

    HideFriendRequestsWindow() {
        this.isFriendRequestsWindowOpen = false;
    }

    AddFriendRequest(friendId: string) {
        let friendRequests: any = this.GetToolbarItem(TOOLBAR_ID.FRIEND_REQUESTS).content;
        friendRequests.send.push(friendId);

        let self = this;
        self.navbarService.AddFriendRequest(friendId).then((result: any) => {
            if (result) {
                self.socketService.SocketEmit("ServerUpdateFriendRequests", friendRequests);
                self.socketService.SocketEmit("SendFriendRequest", friendId);
                self.eventService.Emit(EVENT_TYPE.sendFriendRequest, friendId);
                self.snackbarService.Snackbar("נשלחה בקשת חברות");
            }
        });
    }

    RemoveFriendRequest(friendId: string, isHideMessageText?: boolean) {
        let friendRequests: any = this.GetToolbarItem(TOOLBAR_ID.FRIEND_REQUESTS).content;
        friendRequests.send.splice(friendRequests.send.indexOf(friendId), 1);

        let self = this;
        self.navbarService.RemoveFriendRequest(friendId).then((result: any) => {
            if (result) {
                self.socketService.SocketEmit("ServerUpdateFriendRequests", friendRequests);
                self.socketService.SocketEmit("RemoveFriendRequest", self.user._id, friendId);
                self.snackbarService.Snackbar("בקשת החברות בוטלה");
            }
        });
    }

    IgnoreFriendRequest(friendId: string, callback?: Function) {
        // Remove the friend request from all friend requests object.
        let friendRequests: any = this.GetToolbarItem(TOOLBAR_ID.FRIEND_REQUESTS).content;
        friendRequests.get.splice(friendRequests.get.indexOf(friendId), 1);

        let self = this;
        self.navbarService.IgnoreFriendRequest(friendId).then((result: any) => {
            if (result) {
                self.socketService.SocketEmit("ServerUpdateFriendRequests", friendRequests);
                self.socketService.SocketEmit("ServerIgnoreFriendRequest", self.user._id, friendId);
                self.socketService.SocketEmit("ServerUpdateFriendRequestsStatus", friendId);
            }

            callback && callback(result);
        });
    }

    ShowFriendRequestNotification(name: string, isConfirm: boolean) {
        this.friendRequestNotificationName = name;

        if (isConfirm) {
            this.isShowFriendConfirmNotification = true
        }
        else {
            this.isShowFriendRequestNotification = true
        }

        let self = this;
        self.friendRequestNotificationInterval = setInterval(() => {
            self.isShowFriendRequestNotification = false;
            self.isShowFriendConfirmNotification = false;
            clearInterval(self.friendRequestNotificationInterval);
            self.friendRequestNotificationInterval = null;
        }, this.notificationDelay);
    }

    AddFriendObjectToUser(friend: any) {
        let userFriends = this.user.friends;

        if (!userFriends.includes(friend._id)) {
            // Add the friend id to the user's friends array.
            userFriends.push(friend._id);

            // Add the friend client object to the friends array.
            this.friends.push(friend);
        }

        this.socketService.SocketEmit("ServerGetOnlineFriends");
    }

    AddFriend(friendId: string, callback?: Function) {
        this.isFriendsLoading = true;

        // Remove the friend request from all friend requests object.
        let friendRequests: any = this.GetToolbarItem(TOOLBAR_ID.FRIEND_REQUESTS).content;
        friendRequests.get.splice(friendRequests.get.indexOf(friendId), 1);

        let self = this;

        self.navbarService.AddFriend(friendId).then((friend: any) => {
            self.isFriendsLoading = false;

            if (friend) {
                self.socketService.RefreshSocket();
                self.socketService.SocketEmit("ServerUpdateFriendRequests", friendRequests);
                self.socketService.SocketEmit("ServerAddFriend", friend);
                self.socketService.SocketEmit("ServerFriendAddedUpdate", friend._id);
                self.socketService.SocketEmit("ServerUpdateFriendRequestsStatus", friendId);
                self.AddFriendObjectToUser(friend);
            }
            else {
                //  Recover the actions in case the server is fail to add the friend. 
                friendRequests.get.push(friendId);
                self.socketService.SocketEmit("ServerUpdateFriendRequests", friendRequests);
            }

            callback && callback(friend);
        });
    }

    MakeFriendTyping(friendId: string) {
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

    CloseChatWindow() {
        this.chatData.isOpen = false;
    }

    OpenNewWindow() {
        this.ClosePopups();
        this.CloseChatWindow();
    }

    RemoveFriend(friendId: string) {
        // ---------- Remove friend notifications on friend requests window ----------
        let friendRequests = this.GetToolbarItem(TOOLBAR_ID.FRIEND_REQUESTS).content;

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
            this.CloseChatWindow();
        }

        // Remove friend messages notifications
        delete this.GetToolbarItem(TOOLBAR_ID.MESSAGES).content[friendId];

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

    GetResultsIds(results: Array<any>) {
        let profilesIds: Array<string> = [];

        results.forEach((result: any) => {
            let id: string = result.originalProfile;
            id && profilesIds.push(id);
        });

        return profilesIds;
    }

    NavigateToLogin() {
        this.router.navigateByUrl("/login");
    }

    Logout() {
        this.cookieService.DeleteUidCookie();
        this.loginService.DeleteTokenFromCookie();
        this.globalService.ResetGlobalVariables();
    }
}