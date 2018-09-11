import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Router } from '@angular/router';

import { Friend, ToolbarItem } from '../../objects/classes';
import { GlobalService } from '../../services/global/global.service';
import { AlertService } from '../../services/alert/alert.service';
import { SnackbarService } from '../../services/snackbar/snackbar.service';
import { AuthService } from '../../services/auth/auth.service';
import { NavbarService } from '../../services/navbar/navbar.service';

declare var $: any;

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
    providers: [NavbarService]
})

export class NavbarComponent implements OnInit, OnDestroy {
    @Input() user: any;
    searchInput: string;
    friends: Array<Friend> = [];
    isFriendsLoading: boolean = false;
    isNewFriendsLabel: boolean = false;
    showNewFriendsLabelTimeout: any;
    hideNewFriendsLabelTimeout: any;
    chatData: any = { "isOpen": false };
    isOpenProfileEditWindow: boolean;

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
    searchResults: Array<any> = [];
    markedResult: number = null;
    isShowSearchResults: boolean = false;
    inputInterval: any;
    checkSocketConnectInterval: any;

    toolbarItems: Array<ToolbarItem>;
    dropMenuDataList: Array<DropMenuData>;

    // START CONFIG VARIABLES //

    searchInputChangeDelay: number = 220; // milliseconds
    notificationDelay: number = 3800; // milliseconds
    checkSocketConnectDelay: number = 5; // seconds
    chatTypingDelay: number = 1500; // milliseconds
    newFriendsLabelDelay: number = 4000; // milliseconds    
    sidenavWidth: string = "230px";

    // END CONFIG VARIABLES //

    // Search users cache objects
    searchCache: any = {};
    profilesCache: any = {};

    subscribeObj: any;

    constructor(private router: Router,
        private authService: AuthService,
        private globalService: GlobalService,
        private alertService: AlertService,
        private snackbarService: SnackbarService,
        private navbarService: NavbarService) {

        this.subscribeObj = this.globalService.data.subscribe((value: any) => {
            // In case isOpenProfileEditWindow is true or false
            if (value["isOpenProfileEditWindow"] != null) {
                value["isOpenProfileEditWindow"] && this.ClosePopups();
                this.isOpenProfileEditWindow = value["isOpenProfileEditWindow"];
            }

            if (value["closeDropMenu"]) {
                this.isDropMenuOpen = false;
            }

            if (value["openNewWindow"]) {
                this.OpenNewWindow();
            }

            if (value["changeSearchInput"]) {
                this.searchInput = value["changeSearchInput"];
            }

            if (value["openChat"]) {
                this.OpenChat(value["openChat"]);
            }

            if (value["AddFriendRequest"]) {
                this.AddFriendRequest(value["AddFriendRequest"]);
            }

            if (value["RemoveFriendRequest"]) {
                this.RemoveFriendRequest(value["RemoveFriendRequest"]);
            }

            if (value["OpenUserProfile"]) {
                this.OpenUserProfile(value["OpenUserProfile"]);
            }
        });

        var self = this;

        self.toolbarItems = [
            {
                id: "messages",
                icon: "far fa-comment-dots",
                innerIconText: "",
                title: "הודעות",
                content: {},
                getNotificationsNumber: function () {
                    var counter = 0;

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
                innerIconText: "",
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
        this.globalService.socket.emit('login');

        var self = this;

        self.dropMenuDataList = [
            new DropMenuData("/panel", "ניהול", null, () => {
                return (self.globalService.IsUserHasRootPermission());
            }),
            new DropMenuData("/profile/" + self.user._id, "פרופיל", (link: string) => {
                self.router.navigateByUrl(link);
            }),
            new DropMenuData("/login", "התנתקות", (link: string) => {
                self.globalService.Logout();
                self.router.navigateByUrl(link);
            })
        ];

        self.checkSocketConnectInterval = setInterval(function () {
            self.authService.IsUserSocketConnect().then(result => {
                // In case the user is login with no connected socket.
                if (result == false) {
                    self.globalService.RefreshSocket();
                    self.globalService.socket.emit("ServerGetOnlineFriends");
                }
                // In case the user is logout.
                else if (result == "-1") {
                    self.globalService.Logout();
                    self.router.navigateByUrl("/login");
                }
            });
        }, self.checkSocketConnectDelay * 1000);

        self.LoadFriendsData(self.user.friends);

        // Loading user messages notifications.
        self.navbarService.GetUserMessagesNotifications().then((result: any) => {
            self.GetToolbarItem("messages").content = result.messagesNotifications || {};
        });

        // Loading user friend requests.
        self.navbarService.GetUserFriendRequests().then((result: any) => {
            self.GetToolbarItem("friendRequests").content = result.friendRequests;
        });

        self.globalService.SocketOn('LogoutUserSessionClient', function (msg: string) {
            self.globalService.Logout();
            self.alertService.Alert({
                title: "התנתקות מהמערכת",
                text: msg,
                showCancelButton: false,
                type: "warning",
                confirmFunc: function () {
                    self.router.navigateByUrl('/login');
                },
                closeFunc: function () {
                    self.router.navigateByUrl('/login');
                }
            });
        });

        self.globalService.SocketOn('GetMessage', function (msgData: any) {
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

        self.globalService.SocketOn('ClientGetOnlineFriends', function (onlineFriendsIds: Array<string>) {
            if (onlineFriendsIds.length > 0) {
                self.friends.forEach(friend => {
                    if (onlineFriendsIds.indexOf(friend._id) != -1) {
                        friend.isOnline = true;
                    }
                });
            }
        });

        self.globalService.SocketOn('GetFriendConnectionStatus', function (statusObj: any) {
            self.friends.forEach(friend => {
                if (friend._id == statusObj.friendId) {
                    friend.isOnline = statusObj.isOnline;
                }
            });
        });

        self.globalService.SocketOn('ClientUpdateFriendRequests', function (friendRequests: Array<any>) {
            self.GetToolbarItem("friendRequests").content = friendRequests;
        });

        self.globalService.SocketOn('GetFriendRequest', function (friendId: string, friendFullName: string) {
            var friendRequests: any = self.GetToolbarItem("friendRequests").content;
            friendRequests.get.push(friendId);
            self.ShowFriendRequestNotification(friendFullName, false);
            self.isHideNotificationsBudget = false;
        });

        self.globalService.SocketOn('DeleteFriendRequest', function (friendId: string) {
            var friendRequests: any = self.GetToolbarItem("friendRequests").content;
            friendRequests.get.splice(friendRequests.get.indexOf(friendId), 1);
        });

        self.globalService.SocketOn('ClientIgnoreFriendRequest', function (friendId: string) {
            var friendRequests: any = self.GetToolbarItem("friendRequests").content;
            friendRequests.send.splice(friendRequests.send.indexOf(friendId), 1);
        });

        self.globalService.SocketOn('ClientAddFriend', function (friend: any) {
            self.AddFriendObjectToUser(friend);
        });

        self.globalService.SocketOn('ClientFriendAddedUpdate', function (friend: any) {
            self.authService.SetCurrUserToken().then((result: any) => {
                if (result) {
                    self.globalService.RefreshSocket();
                    self.globalService.socket.emit("ServerGetOnlineFriends");
                }
            });

            var friendRequests: any = self.GetToolbarItem("friendRequests").content;

            // Remove friend id from send array and push it to the friends array.
            friendRequests.send.splice(friendRequests.send.indexOf(friend._id), 1);
            self.user.friends.push(friend._id);
            self.friends.push(friend);

            // Add the friend id to the confirmed requests array and show notifications.
            self.GetToolbarItem('friendRequests').content.accept.push(friend._id);
            self.isHideNotificationsBudget = false;
            self.ShowFriendRequestNotification(friend.firstName + " " + friend.lastName, true);

            self.globalService.socket.emit("ServerUpdateFriendRequests", friendRequests);
            self.globalService.socket.emit("RemoveFriendRequest", self.user._id, friend._id);
            self.globalService.socket.emit("ServerGetOnlineFriends");
        });

        self.globalService.SocketOn('ClientFriendTyping', function (friendId: string) {
            self.MakeFriendTyping(friendId);
        });

        self.globalService.SocketOn('ClientRemoveFriendUser', function (friendId: string, userName: string) {
            self.RemoveFriend(friendId);

            self.alertService.Alert({
                title: "מחיקת משתמש מהאתר",
                text: "החשבון של " + "<b>" + userName + "</b>" + " נמחק מהאתר לצמיתות.",
                showCancelButton: false,
                type: "info"
            });
        });

        self.globalService.SocketOn('ClientRemoveFriend', function (friendId: string) {
            self.authService.SetCurrUserToken().then((result: any) => {
                if (result) {
                    self.globalService.RefreshSocket();
                }
            });

            self.RemoveFriend(friendId);
        });
    }

    ngOnDestroy() {
        this.subscribeObj.unsubscribe();
        clearInterval(this.checkSocketConnectInterval);
    }

    IsShowFriendFindInput() {
        return $(".sidenav-body-sector").hasScrollBar();
    }

    AddMessageToToolbarMessages(msgData: any) {
        var notificationsMessages = this.GetToolbarItem("messages").content;
        var friendMessages = notificationsMessages[msgData.from];

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
        var notificationsMessages = this.GetToolbarItem("messages").content;

        if (notificationsMessages[friendId]) {
            delete (notificationsMessages[friendId]);
            this.navbarService.RemoveMessagesNotifications(notificationsMessages);
        }
    }

    // Return item object from toolbar items array by its id.
    GetToolbarItem(id: string): any {
        for (var i = 0; i < this.toolbarItems.length; i++) {
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

            var self = this;
            self.messageNotificationInterval = setInterval(function () {
                self.isShowMessageNotification = false;
                clearInterval(self.messageNotificationInterval);
                self.messageNotificationInterval = null;
            }, self.notificationDelay);
        }
    }

    GetFriendNameById(id: string): string {
        for (var i = 0; i < this.friends.length; i++) {
            if (this.friends[i]._id == id) {
                return (this.friends[i].firstName + " " + this.friends[i].lastName);
            }
        }

        return null;
    }

    GetFriendById(id: string): Friend {
        for (var i = 0; i < this.friends.length; i++) {
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
                this.globalService.socket && this.globalService.socket.emit("ServerGetOnlineFriends");
            });
        }
    }

    ShowHideSidenav() {
        this.isNewFriendsLabel = false;
        this.isHideNotificationsBudget = true;

        if (this.isSidenavOpen) {
            this.HideSidenav();
        }
        else {
            this.isSidenavOpen = true;
            this.HideDropMenu();
            this.HideSearchResults();
            document.getElementById("sidenav").style.width = this.sidenavWidth;
            $("#open-sidenav-btn").removeClass("close-sidenav");
        }
    }

    HideSidenav() {
        if (this.isSidenavOpen) {
            this.HideChatsWindow();
            this.HideFriendRequestsWindow();
            this.isSidenavOpen = false;
            document.getElementById("sidenav").style.width = "0";
            $("#open-sidenav-btn").addClass("close-sidenav");
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

    ShowSearchResults() {
        this.isShowSearchResults = true;

        if (this.isShowSearchResults) {
            this.HideSidenav();
            this.HideDropMenu();
        }
    }

    HideSearchResults() {
        this.isShowSearchResults = false;
    }

    ClickSearchInput(input: string) {
        if (input) {
            this.isShowSearchResults = true;
            this.SearchChange(this.searchInput);
        }
        else {
            this.isShowSearchResults = false;
        }

        this.HideSidenav();
        this.HideDropMenu();
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

    SearchChange(input: string) {
        this.markedResult = null;
        this.isNewFriendsLabel = false;
        this.inputInterval && clearTimeout(this.inputInterval);

        var self = this;

        // In case the input is not empty.
        if (input && (input = input.trim())) {
            // Recover search results from cache if exists.
            var cachedUsers = this.GetSearchUsersFromCache(input);

            // In case cached users result found for this query input.
            if (cachedUsers) {
                this.GetResultImagesFromCache(cachedUsers);
                this.searchResults = cachedUsers;
                this.ShowSearchResults();
            }

            // Clear cached users (with full profiles) from memory.
            cachedUsers = null;

            self.inputInterval = setTimeout(function () {
                self.navbarService.GetMainSearchResults(input).then((results: Array<any>) => {
                    if (results && results.length > 0 && input == self.searchInput.trim()) {
                        self.InsertSearchUsersToCache(input, results);
                        self.GetResultImagesFromCache(results);
                        self.searchResults = results;
                        self.ShowSearchResults();

                        self.navbarService.GetMainSearchResultsWithImages(self.GetResultsIds(results)).then((profiles: any) => {
                            if (profiles && Object.keys(profiles).length > 0 && input == self.searchInput.trim()) {
                                self.searchResults.forEach((result: any) => {
                                    if (result.originalProfile) {
                                        result.profile = profiles[result.originalProfile];
                                    }
                                });

                                self.InsertResultsImagesToCache(profiles);
                            }
                        });
                    }
                });
            }, self.searchInputChangeDelay);
        }
        else {
            self.HideSearchResults();
            self.searchResults = [];
        }
    }

    SearchKeyUp(event: any) {
        if (this.searchResults.length > 0 && this.isShowSearchResults) {
            if (event.key == "ArrowDown") {
                if (this.markedResult != null) {
                    this.markedResult = (this.markedResult + 1) % (this.searchResults.length + 1);
                }
                else {
                    this.markedResult = 0;
                }
            }
            else if (event.key == "ArrowUp") {
                if (this.markedResult != null) {
                    if (this.markedResult == 0) {
                        this.markedResult = this.searchResults.length;
                    }
                    else {
                        this.markedResult -= 1;
                    }
                }
                else {
                    this.markedResult = this.searchResults.length - 1;
                }
            }
            else if (event.key == "Enter" || event.key == "NumpadEnter") {
                if (this.markedResult != null) {
                    this.OpenUserProfile(this.searchResults[this.markedResult]);
                }
            }
            else if (event.key == "Escape") {
                this.isShowSearchResults = false;
            }
        }
    }

    InsertResultsImagesToCache(profiles: any) {
        var self = this;

        Object.keys(profiles).forEach((profileId: string) => {
            self.profilesCache[profileId] = profiles[profileId];
        });
    }

    GetResultImagesFromCache(results: any) {
        var self = this;

        results.forEach((result: any) => {
            if (result.originalProfile && (self.profilesCache[result.originalProfile] != null)) {
                result.profile = self.profilesCache[result.originalProfile];
            }
        });
    }

    InsertSearchUsersToCache(searchInput: string, results: Array<any>) {
        var resultsClone: Array<any> = [];

        results.forEach((result: any) => {
            resultsClone.push(Object.assign({}, result));
        });

        this.searchCache[searchInput] = resultsClone;
    }

    GetSearchUsersFromCache(searchInput: string) {
        return this.searchCache[searchInput];
    }

    GetFilteredSearchResults(searchInput: string): Array<any> {
        if (!searchInput) {
            return this.searchResults;
        }
        else {
            searchInput = searchInput.trim();
            searchInput = searchInput.replace(/\\/g, '');
            this.searchResults = this.searchResults.filter(function (result: any) {
                return ((result.fullName.indexOf(searchInput) == 0) ||
                    (result.fullNameReversed.indexOf(searchInput) == 0));
            });

            return this.searchResults;
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
                var aName = a.firstName + " " + a.lastName;
                var bName = b.firstName + " " + b.lastName;

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
        var friendNotificationsMessages = this.GetToolbarItem("messages").content[friendId];

        if (friendNotificationsMessages) {
            return "(" + friendNotificationsMessages.unreadMessagesNumber + ")"
        }
        else {
            return "";
        }
    }

    OpenChat(friend: any) {
        this.HideSidenav();

        if (!this.chatData.isOpen || !this.chatData.friend || this.chatData.friend._id != friend._id) {
            var messagesNotifications = Object.assign({}, this.GetToolbarItem("messages").content);

            // Empty unread messages notifications from the currend friend.
            this.RemoveFriendMessagesFromToolbarMessages(friend._id);

            // Put default profile in case the friend has no profile image.
            if (!friend.profileImage) {
                friend.profileImage = this.globalService.defaultProfileImage;
            }

            this.chatData.friend = friend;
            this.chatData.user = this.user;
            this.chatData.messagesNotifications = messagesNotifications;
            this.chatData.isOpen = true;

            this.globalService.setData("chatData", this.chatData);
        }
        else {
            this.globalService.setData("moveToChatWindow", true);
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
        var friendRequests: any = this.GetToolbarItem("friendRequests").content;
        friendRequests.send.push(friendId);

        var self = this;
        self.navbarService.AddFriendRequest(friendId).then(function (result: any) {
            if (result) {
                self.globalService.socket.emit("ServerUpdateFriendRequests", friendRequests);
                self.globalService.socket.emit("SendFriendRequest", friendId);
                self.snackbarService.Snackbar("נשלחה בקשת חברות");
            }
        });
    }

    RemoveFriendRequest(friendId: string, isHideMessageText?: boolean) {
        var friendRequests: any = this.GetToolbarItem("friendRequests").content;
        friendRequests.send.splice(friendRequests.send.indexOf(friendId), 1);

        var self = this;
        this.navbarService.RemoveFriendRequest(friendId).then(function (result: any) {
            if (result) {
                self.globalService.socket.emit("ServerUpdateFriendRequests", friendRequests);
                self.globalService.socket.emit("RemoveFriendRequest", self.user._id, friendId);
                self.snackbarService.Snackbar("בקשת החברות בוטלה");
            }
        });
    }

    IgnoreFriendRequest(friendId: string, callback?: Function) {
        // Remove the friend request from all friend requests object.
        var friendRequests: any = this.GetToolbarItem("friendRequests").content;
        friendRequests.get.splice(friendRequests.get.indexOf(friendId), 1);

        var self = this;
        this.navbarService.IgnoreFriendRequest(friendId).then(function (result: any) {
            if (result) {
                self.globalService.socket.emit("ServerUpdateFriendRequests", friendRequests);
                self.globalService.socket.emit("ServerIgnoreFriendRequest", self.user._id, friendId);
                self.globalService.socket.emit("ServerUpdateFriendRequestsStatus", friendId);
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

        var self = this;
        self.friendRequestNotificationInterval = setInterval(function () {
            self.isShowFriendRequestNotification = false;
            self.isShowFriendConfirmNotification = false;
            clearInterval(self.friendRequestNotificationInterval);
            self.friendRequestNotificationInterval = null;
        }, this.notificationDelay);
    }

    IsShowAddFriendRequestBtn(friendId: string) {
        var friendRequests: any = this.GetToolbarItem("friendRequests").content;

        return (friendId != this.user._id &&
            this.user.friends.indexOf(friendId) == -1 &&
            friendRequests.send.indexOf(friendId) == -1 &&
            friendRequests.get.indexOf(friendId) == -1);
    }

    IsShowRemoveFriendRequestBtn(friendId: string) {
        var friendRequests: any = this.GetToolbarItem("friendRequests").content;

        if (friendRequests.send.indexOf(friendId) != -1) {
            return true;
        }
        else {
            return false;
        }
    }

    IsShowFriendRequestConfirmSector(friendId: string) {
        var friendRequests: any = this.GetToolbarItem("friendRequests").content;

        if (friendRequests.get.indexOf(friendId) != -1) {
            return true;
        }
        else {
            return false;
        }
    }

    AddFriendObjectToUser(friend: any) {
        var userFriends = this.user.friends;

        if (userFriends.indexOf(friend._id) == -1) {
            // Add the friend id to the user's friends array.
            userFriends.push(friend._id);
        }

        // Add the friend client object to the friends array.
        this.friends.push(friend);
        this.globalService.socket.emit("ServerGetOnlineFriends");
    }

    AddFriend(friendId: string, callback?: Function) {
        this.isFriendsLoading = true;

        // Remove the friend request from all friend requests object.
        var friendRequests: any = this.GetToolbarItem("friendRequests").content;
        friendRequests.get.splice(friendRequests.get.indexOf(friendId), 1);

        // Add the friend id to the user's friends array.
        var userFriends = this.user.friends;
        userFriends.push(friendId);

        var self = this;

        self.navbarService.AddFriend(friendId).then(function (friend: any) {
            self.isFriendsLoading = false;

            if (friend) {
                self.globalService.RefreshSocket();
                self.globalService.socket.emit("ServerUpdateFriendRequests", friendRequests);
                self.globalService.socket.emit("ServerAddFriend", friend);
                self.globalService.socket.emit("ServerFriendAddedUpdate", friend._id);
                self.globalService.socket.emit("ServerUpdateFriendRequestsStatus", friendId);
            }
            else {
                //  Recover the actions in case the server is fail to add the friend. 
                friendRequests.get.push(friendId);
                userFriends.splice(userFriends.indexOf(friendId), 1);
                self.globalService.socket.emit("ServerUpdateFriendRequests", friendRequests);
            }

            callback && callback(friend);
        });
    }

    MakeFriendTyping(friendId: string) {
        var friendObj: Friend = this.friends.find((friend: Friend) => {
            return (friend._id == friendId);
        });

        if (friendObj) {
            friendObj.typingTimer && clearTimeout(friendObj.typingTimer);
            friendObj.isTyping = true;

            var self = this;

            friendObj.typingTimer = setTimeout(function () {
                friendObj.isTyping = false;
            }, self.chatTypingDelay);
        }
    }

    SearchNewFriends() {
        this.searchInput = "";
        $("#search-input").focus();
        clearTimeout(this.showNewFriendsLabelTimeout);
        clearTimeout(this.hideNewFriendsLabelTimeout);
        var self = this;

        self.showNewFriendsLabelTimeout = setTimeout(function () {
            self.isNewFriendsLabel = true;
            self.hideNewFriendsLabelTimeout = setTimeout(function () {
                self.isNewFriendsLabel = false;
            }, self.newFriendsLabelDelay);
        }, 200);        
    }

    CloseChatWindow() {
        this.chatData.isOpen = false;
    }

    NavigateMain() {
        this.ClosePopups();
        this.CloseChatWindow();
        this.searchInput = "";
        this.router.navigateByUrl('');
    }

    GetNotificationsNumber() {
        var notificationsAmount = 0;

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

        var friendRequestGetIndex = this.GetToolbarItem('friendRequests').content.get.indexOf(friendId);
        var friendRequestSendIndex = this.GetToolbarItem('friendRequests').content.send.indexOf(friendId);
        var friendRequestAcceptIndex = this.GetToolbarItem('friendRequests').content.accept.indexOf(friendId);

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
        for (var i = 0; i < this.user.friends.length; i++) {
            if (this.user.friends[i] == friendId) {
                this.user.friends.splice(i, 1);
                break;
            }
        }

        // Removing friend from user friends objects list.
        for (var i = 0; i < this.friends.length; i++) {
            if (this.friends[i]._id == friendId) {
                this.friends.splice(i, 1);
                break;
            }
        }
    }

    GetResultsIds(results: Array<any>) {
        var profilesIds: Array<string> = [];
        var resultsIdsWithNoProfile: Array<string> = [];

        results.forEach((result: any) => {
            var id: string = result.originalProfile;

            if (id) {
                profilesIds.push(id);
            }
            else {
                resultsIdsWithNoProfile.push(result._id);
            }
        });

        var data = {
            "profilesIds": profilesIds,
            "resultsIdsWithNoProfile": resultsIdsWithNoProfile
        };

        return data;
    }

    OpenUserProfile(user: any) {
        this.HideSearchResults();
        this.searchInput = user.firstName + " " + user.lastName;
        this.router.navigateByUrl("/profile/" + user._id);
    }
}