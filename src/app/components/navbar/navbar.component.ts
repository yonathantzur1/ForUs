import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Router } from '@angular/router';

import { GlobalService } from '../../services/global/global.service';
import { ImageService } from 'src/app/services/global/image.service';
import { SocketService } from '../../services/global/socket.service';
import { PermissionsService } from '../../services/global/permissions.service';
import { CookieService } from '../../services/global/cookie.service';
import { EventService } from '../../services/global/event.service';
import { AlertService, ALERT_TYPE } from '../../services/global/alert.service';
import { SnackbarService } from '../../services/global/snackbar.service';
import { AuthService } from '../../services/global/auth.service';
import { NavbarService } from '../../services/navbar.service';
import { LoginService } from '../../services/welcome/login.service';
import { SOCKET_STATE } from '../../enums/enums';

class Friend {
    _id: string;
    firstName: string;
    lastName: string;
    profileImage: string;
    isOnline: boolean;
    isTyping: boolean;
    typingTimer: any;
}

class ToolbarItem {
    id: string;
    icon: string;
    innerIconText: string;
    title: string;
    content: Object;
    getNotificationsNumber: Function;
    isShowToolbarItemBadget: Function;
    onClick: Function;
}

declare let $: any;

export class DropMenuData {
    link: string;
    text: string;
    action: Function;
    showFunction: Function;

    constructor(link: string, text: string, action: Function, showFunction?: Function) {
        this.link = link;
        this.text = text;
        this.action = action;
        this.showFunction = showFunction ? showFunction : () => { return true; };
    }
}

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
    showNewFriendsLabelTimeout: any;
    hideNewFriendsLabelTimeout: any;
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
    isSidenavOpen: boolean = false;
    isHideNotificationsBudget: boolean = false;
    isDropMenuOpen: boolean;
    checkSocketConnectInterval: any;
    checkOnlineFriendsInterval: any;

    toolbarItems: Array<ToolbarItem>;
    dropMenuDataList: Array<DropMenuData>;

    // START CONFIG VARIABLES //

    notificationDelay: number = 3800; // milliseconds
    checkSocketConnectDelay: number = 4; // seconds
    checkOnlineFriendsDelay: number = 5; // seconds
    chatTypingDelay: number = 1200; // milliseconds
    newFriendsLabelDelay: number = 4000; // milliseconds    
    sidenavWidth: string = "230px";
    searchInputId: string = "search-input";

    // END CONFIG VARIABLES //

    // Search users cache objects
    searchCache: any = {};
    profilesCache: any = {};

    eventsIds: Array<string> = [];

    constructor(private router: Router,
        private authService: AuthService,
        private globalService: GlobalService,
        public imageService: ImageService,
        private socketService: SocketService,
        private permissionsService: PermissionsService,
        private cookieService: CookieService,
        private eventService: EventService,
        public alertService: AlertService,
        public snackbarService: SnackbarService,
        private loginService: LoginService,
        private navbarService: NavbarService) {

        let self = this;

        //#region events
        eventService.Register("showProfileEditWindow", (isShow: boolean) => {
            isShow && this.ClosePopups();
            self.isOpenProfileEditWindow = isShow;
        }, self.eventsIds);

        eventService.Register("setNavbarUnder", () => {
            self.isNavbarUnder = true;
        }, self.eventsIds);

        eventService.Register("setNavbarTop", () => {
            self.isNavbarUnder = false;
        }, self.eventsIds);

        eventService.Register("hideSidenav", () => {
            self.HideSidenav();
        }, self.eventsIds);

        eventService.Register("closeDropMenu", () => {
            self.isDropMenuOpen = false;
        }, self.eventsIds);

        eventService.Register("openNewWindow", () => {
            self.OpenNewWindow();
        }, self.eventsIds);

        eventService.Register("openChat", (friend: any) => {
            self.OpenChat(friend);
        }, self.eventsIds);

        //#region friend requests functions
        eventService.Register("addFriendRequest", (friendId: string) => {
            self.AddFriendRequest(friendId);
        }, self.eventsIds);

        eventService.Register("removeFriendRequest", (friendId: string) => {
            self.RemoveFriendRequest(friendId);
        }, self.eventsIds);

        eventService.Register("addFriend", (friendId: string) => {
            self.AddFriend(friendId);
        }, self.eventsIds);

        eventService.Register("ignoreFriendRequest", (friendId: string) => {
            self.IgnoreFriendRequest(friendId);
        }, self.eventsIds);
        //#endregion
        //#endregion

        self.toolbarItems = [
            {
                id: "messages",
                icon: "far fa-comment-dots",
                innerIconText: '',
                title: "הודעות",
                content: {},
                getNotificationsNumber: function () {
                    let counter = 0;

                    Object.keys(this.content).forEach(id => {
                        counter += this.content[id].unreadMessagesNumber;
                    })

                    return counter;
                },
                isShowToolbarItemBadget: function () {
                    return (this.getNotificationsNumber() > 0);
                },
                onClick: function () {
                    self.ShowHideChatsWindow();
                }
            },
            {
                id: "friendRequests",
                icon: "fas fa-user-friends fa-sm",
                innerIconText: '',
                title: "בקשות חברות",
                content: {
                    get: [],
                    send: [],
                    accept: []
                },
                getNotificationsNumber: function () {
                    return this.content.get.length + this.content.accept.length;
                },
                isShowToolbarItemBadget: function () {
                    return (this.getNotificationsNumber() > 0);
                },
                onClick: function () {
                    self.ShowHideFriendRequestsWindow();
                }
            }
        ];
    }

    ngOnInit() {
        this.socketService.SocketEmit('login');

        let self = this;

        self.dropMenuDataList = [
            new DropMenuData("/panel", "ניהול", null, () => {
                return (self.permissionsService.IsUserHasRootPermission());
            }),
            new DropMenuData("/profile/" + self.user._id, "פרופיל", (link: string) => {
                self.router.navigateByUrl(link);
            }),
            new DropMenuData("/login", "התנתקות", (link: string) => {
                self.snackbarService.HideSnackbar();
                self.Logout();
                self.router.navigateByUrl(link);
            })
        ];

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

        self.LoadFriendsData(self.user.friends);

        // Loading user messages notifications.
        self.navbarService.GetUserMessagesNotifications().then((result: any) => {
            self.GetToolbarItem("messages").content = result.messagesNotifications || {};
        });

        // Loading user friend requests.
        self.navbarService.GetUserFriendRequests().then((result: any) => {
            self.GetToolbarItem("friendRequests").content = result.friendRequests;
        });

        self.socketService.SocketOn('LogoutUserSessionClient', function (msg: string) {
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

        self.socketService.SocketOn('GetMessage', function (msgData: any) {
            if (!self.chatData.isOpen || msgData.from != self.chatData.friend._id) {
                self.AddMessageToToolbarMessages(msgData);

                if (!self.chatData.isOpen) {
                    // Turn off the open notification.
                    self.isShowMessageNotification = false;

                    if (self.messageNotificationInterval) {
                        clearInterval(self.messageNotificationInterval);
                        self.messageNotificationInterval = null;
                    }

                    self.ShowMessageNotification(self.GetFriendNameById(msgData.from), msgData.text, msgData.isImage, msgData.from);
                    self.isHideNotificationsBudget = false;
                }
            }
        });

        self.socketService.SocketOn('ClientGetOnlineFriends', function (onlineFriendsIds: Array<string>) {
            // In case one or more friends are connected. 
            if (onlineFriendsIds.length > 0) {
                self.friends.forEach(friend => {
                    friend.isOnline = (onlineFriendsIds.indexOf(friend._id) != -1);
                });
            }
            else {
                self.friends.forEach(friend => {
                    friend.isOnline = false;
                });
            }
        });

        self.socketService.SocketOn('UpdateFriendConnectionStatus', function (statusObj: any) {
            self.friends.forEach(friend => {
                if (friend._id == statusObj.friendId) {
                    friend.isOnline = statusObj.isOnline;
                }
            });
        });

        self.socketService.SocketOn('ClientUpdateFriendRequests', function (friendRequests: Array<any>) {
            self.GetToolbarItem("friendRequests").content = friendRequests;
        });

        self.socketService.SocketOn('GetFriendRequest', function (friendId: string, friendFullName: string) {
            let friendRequests: any = self.GetToolbarItem("friendRequests").content;
            friendRequests.get.push(friendId);
            self.ShowFriendRequestNotification(friendFullName, false);
            self.isHideNotificationsBudget = false;
        });

        self.socketService.SocketOn('DeleteFriendRequest', function (friendId: string) {
            let friendRequests: any = self.GetToolbarItem("friendRequests").content;
            friendRequests.get.splice(friendRequests.get.indexOf(friendId), 1);
            self.eventService.Emit("RemoveUserFromNavbarSearchCache", friendId);
        });

        self.socketService.SocketOn('ClientIgnoreFriendRequest', function (friendId: string) {
            let friendRequests: any = self.GetToolbarItem("friendRequests").content;
            friendRequests.send.splice(friendRequests.send.indexOf(friendId), 1);
        });

        self.socketService.SocketOn('ClientAddFriend', function (friend: any) {
            self.AddFriendObjectToUser(friend);
        });

        self.socketService.SocketOn('ClientFriendAddedUpdate', function (friend: any) {
            self.authService.SetCurrUserToken().then((result: any) => {
                if (result) {
                    self.socketService.RefreshSocket();
                    self.socketService.SocketEmit("ServerGetOnlineFriends");
                }
            });

            let friendRequests: any = self.GetToolbarItem("friendRequests").content;

            // Remove friend id from send array and push it to the friends array.
            friendRequests.send.splice(friendRequests.send.indexOf(friend._id), 1);
            self.user.friends.push(friend._id);
            self.friends.push(friend);

            // Add the friend id to the confirmed requests array and show notifications.
            self.GetToolbarItem('friendRequests').content.accept.push(friend._id);
            self.isHideNotificationsBudget = false;
            self.ShowFriendRequestNotification(friend.firstName + " " + friend.lastName, true);

            self.socketService.SocketEmit("ServerUpdateFriendRequests", friendRequests);
            self.socketService.SocketEmit("RemoveFriendRequest", self.user._id, friend._id);
            self.socketService.SocketEmit("ServerGetOnlineFriends");
        });

        self.socketService.SocketOn('ClientFriendTyping', function (friendId: string) {
            self.MakeFriendTyping(friendId);
        });

        self.socketService.SocketOn('ClientRemoveFriendUser', function (friendId: string, userName: string) {
            self.RemoveFriend(friendId);

            self.alertService.Alert({
                title: "מחיקת משתמש מהאתר",
                text: "החשבון של " + "<b>" + userName + "</b>" + " נמחק מהאתר לצמיתות.",
                showCancelButton: false,
                type: ALERT_TYPE.INFO
            });
        });

        self.socketService.SocketOn('ClientRemoveFriend', function (friendId: string) {
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

    IsShowFriendFindInput() {
        return $(".sidenav-body-sector").hasScrollBar();
    }

    AddMessageToToolbarMessages(msgData: any) {
        let notificationsMessages = this.GetToolbarItem("messages").content;
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
        let notificationsMessages = this.GetToolbarItem("messages").content;

        if (notificationsMessages[friendId]) {
            delete (notificationsMessages[friendId]);
            this.navbarService.RemoveMessagesNotifications(notificationsMessages);
        }
    }

    // Return item object from toolbar items array by its id.
    GetToolbarItem(id: string): any {
        for (let i = 0; i < this.toolbarItems.length; i++) {
            if (this.toolbarItems[i].id == id) {
                return this.toolbarItems[i];
            }
        }
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
        for (let i = 0; i < this.friends.length; i++) {
            if (this.friends[i]._id == id) {
                return (this.friends[i].firstName + " " + this.friends[i].lastName);
            }
        }

        return null;
    }

    GetFriendById(id: string): Friend {
        for (let i = 0; i < this.friends.length; i++) {
            if (this.friends[i]._id == id) {
                return this.friends[i];
            }
        }

        return null;
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

    // Loading full friends objects to friends array.
    LoadFriendsData(friendsIds: Array<string>) {
        if (friendsIds.length > 0) {
            this.isFriendsLoading = true;
            this.navbarService.GetFriends(friendsIds).then((friendsResult: Array<Friend>) => {
                this.friends = friendsResult;
                this.isFriendsLoading = false;
                this.socketService.SocketEmit("ServerGetOnlineFriends");
            });
        }
    }

    ShowHideSidenav() {
        this.SetNewFriendsLabelVisability(false);

        if (this.isSidenavOpen) {
            this.HideSidenav();
        }
        else {
            this.isSidenavOpen = true;
            this.isHideNotificationsBudget = true;
            this.HideDropMenu();
            this.HideSearchResults();
            $("#sidenav").width(this.sidenavWidth);
            $("body").addClass("no-overflow");
        }
    }

    HideSidenav() {
        if (this.isSidenavOpen) {
            this.isHideNotificationsBudget = true;
            this.HideChatsWindow();
            this.HideFriendRequestsWindow();
            this.isSidenavOpen = false;
            $("#sidenav").width("0px");
            $("body").removeClass("no-overflow");
        }
    }

    ShowHideDropMenu() {
        this.isDropMenuOpen = !this.isDropMenuOpen;

        if (this.isDropMenuOpen) {
            this.HideSidenav();
            this.HideSearchResults();
        }
    }

    HideDropMenu() {
        this.isDropMenuOpen = false;
    }

    HideSearchResults() {
        this.eventService.Emit("hideSearchResults");
    }

    ChangeSearchInput(str: string) {
        this.eventService.Emit("changeSearchInput", str);
    }

    ClosePopups() {
        this.HideSidenav();
        this.HideDropMenu();
        this.HideSearchResults();
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

    GetFilteredFriends(friendSearchInput: string): Array<any> {
        if (!friendSearchInput) {
            return this.friends;
        }
        else {
            friendSearchInput = friendSearchInput.trim();
            friendSearchInput = friendSearchInput.replace(/\\/g, '');
            return this.friends.filter(function (friend: any) {
                return (((friend.firstName + " " + friend.lastName).indexOf(friendSearchInput) == 0) ||
                    ((friend.lastName + " " + friend.firstName).indexOf(friendSearchInput) == 0));
            });
        }
    }

    GetSidebarFriends(friendSearchInput: string): Array<any> {
        return this.GetFilteredFriends(friendSearchInput).sort(function (a, b) {
            if (a.isOnline && !b.isOnline) {
                return -1;
            }
            else if (b.isOnline && !a.isOnline) {
                return 1;
            }
            else {
                let aName = a.firstName + " " + a.lastName;
                let bName = b.firstName + " " + b.lastName;

                if (aName > bName) {
                    return 1;
                }
                else {
                    return -1;
                }
            }
        });
    }

    GetFriendUnreadMessagesNumberText(friendId: string) {
        let friendNotificationsMessages = this.GetToolbarItem("messages").content[friendId];

        if (friendNotificationsMessages) {
            return "- (" + friendNotificationsMessages.unreadMessagesNumber + ")"
        }
        else {
            return '';
        }
    }

    OpenChat(friend: any) {
        this.HideMessageNotification();
        this.HideSidenav();

        if (!this.chatData.isOpen || !this.chatData.friend || this.chatData.friend._id != friend._id) {
            let messagesNotifications = Object.assign({}, this.GetToolbarItem("messages").content);

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

            this.eventService.Emit("setChatData", this.chatData);
        }
        else {
            this.eventService.Emit("moveToChatWindow", true);
        }
    }

    ShowHideChatsWindow() {
        this.isChatsWindowOpen = !this.isChatsWindowOpen;

        // Scroll chat window to top after the view is getting refreshed.
        setTimeout(() => {
            $("#chatsWindow .body-container")[0].scrollTop = 0
        }, 0);
    }

    HideChatsWindow() {
        this.isChatsWindowOpen = false;
    }

    ShowHideFriendRequestsWindow() {
        this.isFriendRequestsWindowOpen = !this.isFriendRequestsWindowOpen;

        // Scroll friend requests window to top after the view is getting refreshed.
        setTimeout(() => {
            $("#friendRequestsWindow .body-container")[0].scrollTop = 0
        }, 0);
    }

    HideFriendRequestsWindow() {
        this.isFriendRequestsWindowOpen = false;
    }

    AddFriendRequest(friendId: string) {
        let friendRequests: any = this.GetToolbarItem("friendRequests").content;
        friendRequests.send.push(friendId);

        let self = this;
        self.navbarService.AddFriendRequest(friendId).then((result: any) => {
            if (result) {
                self.socketService.SocketEmit("ServerUpdateFriendRequests", friendRequests);
                self.socketService.SocketEmit("SendFriendRequest", friendId);
                self.eventService.Emit("sendFriendRequest", friendId);
                self.snackbarService.Snackbar("נשלחה בקשת חברות");
            }
        });
    }

    RemoveFriendRequest(friendId: string, isHideMessageText?: boolean) {
        let friendRequests: any = this.GetToolbarItem("friendRequests").content;
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
        let friendRequests: any = this.GetToolbarItem("friendRequests").content;
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

        if (userFriends.indexOf(friend._id) == -1) {
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
        let friendRequests: any = this.GetToolbarItem("friendRequests").content;
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

    SearchNewFriends() {
        this.ChangeSearchInput('');
        $("#" + this.searchInputId).focus();
        clearTimeout(this.showNewFriendsLabelTimeout);
        clearTimeout(this.hideNewFriendsLabelTimeout);
        let self = this;

        self.showNewFriendsLabelTimeout = setTimeout(() => {
            self.SetNewFriendsLabelVisability(true);
            self.hideNewFriendsLabelTimeout = setTimeout(() => {
                self.SetNewFriendsLabelVisability(false);
            }, self.newFriendsLabelDelay);
        }, 200);
    }

    SetNewFriendsLabelVisability(isVisible: boolean) {
        this.eventService.Emit("setNewFriendsLabelVisability", isVisible);
    }

    CloseChatWindow() {
        this.chatData.isOpen = false;
    }

    NavigateMain() {
        this.ClosePopups();
        this.CloseChatWindow();
        this.ChangeSearchInput('');
        this.router.navigateByUrl('');
    }

    GetNotificationsNumber() {
        let notificationsAmount = 0;

        this.toolbarItems.forEach((item: ToolbarItem) => {
            notificationsAmount += item.getNotificationsNumber();
        });

        return notificationsAmount;
    }

    OpenNewWindow() {
        this.ClosePopups();
        this.CloseChatWindow();
    }

    RemoveFriend(friendId: string) {
        // ---------- Remove friend notifications on friend requests window ----------

        let friendRequestGetIndex = this.GetToolbarItem('friendRequests').content.get.indexOf(friendId);
        let friendRequestSendIndex = this.GetToolbarItem('friendRequests').content.send.indexOf(friendId);
        let friendRequestAcceptIndex = this.GetToolbarItem('friendRequests').content.accept.indexOf(friendId);

        if (friendRequestGetIndex != -1) {
            this.GetToolbarItem('friendRequests').content.get.splice(friendRequestGetIndex, 1);
        }

        if (friendRequestSendIndex != -1) {
            this.GetToolbarItem('friendRequests').content.send.splice(friendRequestSendIndex, 1);
        }

        if (friendRequestAcceptIndex != -1) {
            this.GetToolbarItem('friendRequests').content.accept.splice(friendRequestAcceptIndex, 1);
        }

        // ---------------------------------------------------------------------------

        // In case chat is open with the friend.
        if (this.chatData.isOpen && this.chatData.friend._id == friendId) {
            this.CloseChatWindow();
        }

        // Remove friend messages notifications
        delete this.GetToolbarItem('messages').content[friendId];

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

    IsShowHeadTitle() {
        return ($(window).width() > 576);
    }

    Logout() {
        this.cookieService.DeleteUidCookie();
        this.loginService.DeleteTokenFromCookie();
        this.globalService.ResetGlobalVariables();
    }
}