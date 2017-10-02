import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

import { GlobalService } from '../../services/global/global.service';
import { AuthService } from '../../services/auth/auth.service';
import { NavbarService } from '../../services/navbar/navbar.service';

declare var getToken: any;
declare var setToken: any;
declare var deleteToken: any;
declare var socket: any;
declare var io: any;

export class DropMenuData {
    constructor(link: string, text: string, action: Function, object: any) { this.link = link, this.text = text, this.action = action, this.object = object }

    link: string;
    text: string;
    action: Function;
    object: any;
}

export class Friend {
    _id: string;
    firstName: string;
    lastName: string;
    profileImage: string;
    isOnline: boolean;
}

export class toolbarItem {
    id: string;
    icon: string;
    title: string;
    content: Object;
    isShowToolbarItemBadget: Function;
    onClick: Function;
}

@Component({
    selector: 'navbar',
    templateUrl: './navbar.html',
    providers: [NavbarService]
})

export class NavbarComponent implements OnInit {
    @Input() user: any;
    friends: Array<Friend> = [];
    isFriendsLoading: boolean = false;
    defaultProfileImage: string = "./app/components/profilePicture/pictures/empty-profile.png";
    chatData: any = { "isOpen": false };
    socket: any;

    // START message notification variables //

    isShowMessageNotification: boolean = false;
    messageNotificationName: string;
    messageNotificationText: string;
    messageNotificationFriendId: string;
    messageNotificationInterval: any;

    // END message notification variables //

    // START friend-request notification variables //

    isShowFriendRequestNotification: boolean = false;
    friendRequestNotificationName: string;
    friendRequestNotificationInterval: any;

    // END friend-request notification variables //

    isUnreadWindowOpen: boolean = false;
    isFriendRequestsWindowOpen: boolean = false;
    isSidebarOpen: boolean = false;
    isDropMenuOpen: boolean = false;
    searchResults: Array<any> = [];
    isShowSearchResults: boolean = false;
    inputInterval: any;

    toolbarItems: Array<toolbarItem>;
    dropMenuDataList: Array<DropMenuData>;

    // START CONFIG VARIABLES //

    searchLimit: number = 4;
    searchInputChangeDelay: number = 140; // milliseconds
    notificationDelay: number = 3800; // milliseconds
    askForOnlineFriendsDelay: number = 30; // seconds

    // END CONFIG VARIABLES //

    constructor(private router: Router, private authService: AuthService,
        private globalService: GlobalService, private navbarService: NavbarService) {
        this.socket = globalService.socket;

        this.globalService.data.subscribe(value => {
            if (value["isOpenProfileEditWindow"]) {
                this.ClosePopups();
                this.globalService.deleteData("isOpenProfileEditWindow");
            }
        });

        var self = this;

        self.toolbarItems = [
            {
                id: "messages",
                icon: "fa fa-envelope-o",
                title: "הודעות",
                content: {},
                isShowToolbarItemBadget: function () {
                    return (Object.keys(this.content).length > 0);
                },
                onClick: function () {
                    self.ShowHideUnreadWindow();
                }
            },
            {
                id: "friendRequests",
                icon: "fa fa-user-plus",
                title: "בקשות חברות",
                content: {
                    get: [],
                    send: []
                },
                isShowToolbarItemBadget: function () {
                    return (this.content.get.length > 0);
                },
                onClick: function () {
                    self.ShowHideFriendRequestsWindow();
                }
            }
        ];

        self.dropMenuDataList = [
            new DropMenuData("#", "הגדרות", null, null),
            new DropMenuData("/login", "התנתקות", function (self: any, link: string) {
                deleteToken();
                self.globalService.GenerateNewSocket();
                self.router.navigateByUrl(link);
            }, self)
        ];
    }

    ngOnInit() {
        this.socket.emit('login', getToken());

        var self = this;

        setInterval(function () {
            self.socket.emit("ServerGetOnlineFriends", getToken());
        }, self.askForOnlineFriendsDelay * 1000);

        self.LoadFriendsData(self.user.friends);

        // Loading user messages notifications.
        self.navbarService.GetUserMessagesNotifications().then((result: any) => {
            var messagesNotifications = result.messagesNotifications ? result.messagesNotifications : {};
            self.GetToolbarItem("messages").content = messagesNotifications;
        });

        // Loading user friend requests.
        self.navbarService.GetUserFriendRequests().then((result: any) => {
            self.GetToolbarItem("friendRequests").content = result.friendRequests;
        });

        self.socket.on('GetMessage', function (msgData: any) {
            if (!self.chatData.isOpen || msgData.from != self.chatData.friend._id) {
                self.AddMessageToToolbarMessages(msgData);

                if (!self.chatData.isOpen) {
                    // Turn off the open notification.
                    self.isShowMessageNotification = false;

                    if (self.messageNotificationInterval) {
                        clearInterval(self.messageNotificationInterval);
                        self.messageNotificationInterval = null;
                    }

                    self.ShowMessageNotification(self.GetFriendNameById(msgData.from), msgData.text, msgData.from);
                }
            }
        });

        self.socket.on('ClientGetOnlineFriends', function (onlineFriendsIds: Array<string>) {
            if (onlineFriendsIds.length > 0) {
                self.friends.forEach(friend => {
                    if (onlineFriendsIds.indexOf(friend._id) != -1) {
                        friend.isOnline = true;
                    }
                });
            }
        });

        self.socket.on('GetFriendConnectionStatus', function (statusObj: any) {
            self.friends.forEach(friend => {
                if (friend._id == statusObj.friendId) {
                    friend.isOnline = statusObj.isOnline;
                }
            });
        });

        self.socket.on('ClientUpdateFriendRequests', function (friendRequests: Array<any>) {
            self.GetToolbarItem("friendRequests").content = friendRequests;
        });

        self.socket.on('GetFriendRequest', function (friendId: string, friendFullName: string) {
            var friendRequests = self.GetToolbarItem("friendRequests").content;
            friendRequests.get.push(friendId);
            self.ShowFriendRequestNotification(friendFullName);
        });

        self.socket.on('DeleteFriendRequest', function (friendId: string) {
            var friendRequests = self.GetToolbarItem("friendRequests").content;
            friendRequests.get.splice(friendRequests.get.indexOf(friendId));
        });

        self.socket.on('ClientIgnoreFriendRequest', function (friendId: string) {
            var friendRequests = self.GetToolbarItem("friendRequests").content;
            friendRequests.send.splice(friendRequests.send.indexOf(friendId));
        });

        self.socket.on('ClientAddFriend', function (result: any) {
            self.AddFriendObjectToUser(result);
        });

        self.socket.on('ClientFriendAddedUpdate', function (friend: any) {
            self.authService.GetCurrUserToken().then((result: any) => {
                if (result.token) {
                    self.RemoveFriendRequest(friend._id);
                    setToken(result.token);
                    self.user.friends.push(friend._id);
                    self.friends.push(friend);
                    self.socket.emit("ServerGetOnlineFriends", getToken());
                }
            });
        });
    }

    IsShowFriendFindInput = function () {
        return $(".slidenav-body-sector").hasScrollBar();
    }

    AddMessageToToolbarMessages = function (msgData: any) {
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

    RemoveFriendMessagesFromToolbarMessages = function (friendId: string) {
        var notificationsMessages = this.GetToolbarItem("messages").content;

        if (notificationsMessages[friendId]) {
            delete (notificationsMessages[friendId]);
            this.navbarService.RemoveMessagesNotifications(notificationsMessages);
        }
    }

    // Return item object from toolbar items array by its id.
    GetToolbarItem = function (id: string) {
        for (var i = 0; i < this.toolbarItems.length; i++) {
            if (this.toolbarItems[i].id == id) {
                return this.toolbarItems[i];
            }
        }
    }

    ShowMessageNotification = function (name: string, text: string, friendId: string) {
        if (name && text) {
            this.messageNotificationName = name;
            this.messageNotificationText = text;
            this.messageNotificationFriendId = friendId;
            this.isShowMessageNotification = true;

            var self = this;
            self.messageNotificationInterval = setInterval(function () {
                self.isShowMessageNotification = false;
                clearInterval(self.messageNotificationInterval);
                self.messageNotificationInterval = null;
            }, this.notificationDelay);
        }
    }

    GetFriendNameById = function (id: string): string {
        for (var i = 0; i < this.friends.length; i++) {
            if (this.friends[i]._id == id) {
                return (this.friends[i].firstName + " " + this.friends[i].lastName);
            }
        }

        return null;
    }

    GetFriendById = function (id: string): Friend {
        for (var i = 0; i < this.friends.length; i++) {
            if (this.friends[i]._id == id) {
                return this.friends[i];
            }
        }

        return null;
    }

    MessageNotificationClicked = function () {
        // Turn off the open notification.
        this.isShowMessageNotification = false;

        if (this.messageNotificationInterval) {
            clearInterval(this.messageNotificationInterval);
            this.messageNotificationInterval = null;
        }

        this.OpenChat(this.GetFriendById(this.messageNotificationFriendId));
    }

    // Loading full friends objects to friends array.
    LoadFriendsData = function (friendsIds: Array<string>) {
        if (friendsIds.length > 0) {
            this.isFriendsLoading = true;
            this.navbarService.GetFriends(friendsIds).then((friendsResult: Array<Friend>) => {
                this.friends = friendsResult;
                this.isFriendsLoading = false;
                this.socket.emit("ServerGetOnlineFriends", getToken());
            });
        }
    }

    ShowHideSidenav = function () {
        this.isSidebarOpen = !this.isSidebarOpen;

        if (this.isSidebarOpen) {
            this.HideDropMenu();
            this.HideSearchResults();
            document.getElementById("sidenav").style.width = "210px";
        }
        else {
            this.HideUnreadWindow();
            this.HideFriendRequestsWindow();
            document.getElementById("sidenav").style.width = "0";
        }
    }

    HideSidenav = function () {
        this.HideUnreadWindow();
        this.HideFriendRequestsWindow();
        this.isSidebarOpen = false;
        document.getElementById("sidenav").style.width = "0";
    }

    ShowHideDropMenu = function () {
        this.isDropMenuOpen = !this.isDropMenuOpen;

        if (this.isDropMenuOpen) {
            this.HideSidenav();
            this.HideSearchResults();
        }
    }

    HideDropMenu = function () {
        this.isDropMenuOpen = false;
    }

    ShowSearchResults = function () {
        this.isShowSearchResults = true;

        if (this.isShowSearchResults) {
            this.HideSidenav();
            this.HideDropMenu();
        }
    }

    HideSearchResults = function () {
        this.isShowSearchResults = false;
    }

    ClickSearchInput = function (input: string) {
        this.isShowSearchResults = input ? true : false;

        this.HideSidenav();
        this.HideDropMenu();
    }

    ClosePopups = function () {
        this.HideSidenav();
        this.HideDropMenu();
        this.HideSearchResults();
    }

    OverlayClicked = function() {
        if (this.isUnreadWindowOpen || this.isFriendRequestsWindowOpen) {
            this.HideUnreadWindow();
            this.HideFriendRequestsWindow();
        }
        else {
            this.ClosePopups();
        }
    }

    SearchChange = function (input: string) {
        var self = this;

        if (self.inputInterval) {
            clearTimeout(self.inputInterval);
        }

        self.inputInterval = setTimeout(function () {
            if (input) {
                input = input.trim();
                self.navbarService.GetMainSearchResults(input, self.searchLimit).then((results: Array<any>) => {
                    if (results && results.length > 0 && input == self.searchInput.trim()) {
                        self.searchResults = results;
                        self.ShowSearchResults();

                        self.navbarService.GetMainSearchResultsWithImages(GetResultsIds(results)).then((profiles: any) => {
                            if (profiles && Object.keys(profiles).length > 0 && input == self.searchInput.trim()) {
                                self.searchResults.forEach(function (result: any) {
                                    if (result.originalProfile) {
                                        result.profile = profiles[result.originalProfile];
                                    }
                                });
                            }
                        });
                    }
                });
            }
            else {
                self.HideSearchResults();
                self.searchResults = [];
            }
        }, self.searchInputChangeDelay);
    }


    GetFilteredSearchResults = function (searchInput: string): Array<any> {
        if (!searchInput) {
            return this.searchResults;
        } else {
            searchInput = searchInput.trim();
            return this.searchResults.filter(function (result: any) {
                return ((result.fullName.indexOf(searchInput) == 0) ||
                    ((result.lastName + " " + result.firstName).indexOf(searchInput) == 0));
            });
        }
    }

    GetFilteredFriends = function (friendSearchInput: string): Array<any> {
        if (!friendSearchInput) {
            return this.friends;
        }
        else {
            friendSearchInput = friendSearchInput.trim();
            return this.friends.filter(function (friend: any) {
                return (((friend.firstName + " " + friend.lastName).indexOf(friendSearchInput) == 0) ||
                    ((friend.lastName + " " + friend.firstName).indexOf(friendSearchInput) == 0));
            });
        }
    }

    GetFriendUnreadMessagesNumberText = function (friendId: string) {
        var friendNotificationsMessages = this.GetToolbarItem("messages").content[friendId];

        if (friendNotificationsMessages) {
            return "(" + friendNotificationsMessages.unreadMessagesNumber + ")"
        }
        else {
            return "";
        }
    }

    OpenChat = function (friend: Friend) {
        this.HideSidenav();

        if (!this.chatData.isOpen || !this.chatData.friend || this.chatData.friend._id != friend._id) {
            var messagesNotifications = Object.assign({}, this.GetToolbarItem("messages").content);

            // Empty unread messages notifications from the currend friend.
            this.RemoveFriendMessagesFromToolbarMessages(friend._id);

            // Put default profile in case the friend has no profile image.
            if (!friend.profileImage) {
                friend.profileImage = this.defaultProfileImage;
            }

            this.chatData.friend = friend;
            this.chatData.user = this.user;
            this.chatData.messagesNotifications = messagesNotifications;
            this.chatData.isOpen = true;

            this.globalService.setData("chatData", this.chatData);
        }
    }

    ShowHideUnreadWindow = function () {
        this.isUnreadWindowOpen = !this.isUnreadWindowOpen;
    }

    HideUnreadWindow = function () {
        this.isUnreadWindowOpen = false;
    }

    ShowHideFriendRequestsWindow = function () {
        this.isFriendRequestsWindowOpen = !this.isFriendRequestsWindowOpen;
    }

    HideFriendRequestsWindow = function () {
        this.isFriendRequestsWindowOpen = false;
    }

    AddFriendRequest = function (friendId: string) {
        var friendRequests = this.GetToolbarItem("friendRequests").content;
        friendRequests.send.push(friendId);

        var self = this;
        self.navbarService.AddFriendRequest(friendId).then(function (result: any) {
            if (result) {
                self.socket.emit("ServerUpdateFriendRequests", getToken(), friendRequests);
                self.socket.emit("SendFriendRequest", getToken(), friendId);
            }
        });
    }

    RemoveFriendRequest = function (friendId: string) {
        var friendRequests = this.GetToolbarItem("friendRequests").content;
        friendRequests.send.splice(friendRequests.send.indexOf(friendId));

        var self = this;
        this.navbarService.RemoveFriendRequest(friendId).then(function (result: any) {
            if (result) {
                self.socket.emit("ServerUpdateFriendRequests", getToken(), friendRequests);
                self.socket.emit("RemoveFriendRequest", self.user._id, friendId);
            }
        });
    }

    ShowFriendRequestNotification = function (name: string) {
        this.friendRequestNotificationName = name;
        this.isShowFriendRequestNotification = true;

        var self = this;
        self.friendRequestNotificationInterval = setInterval(function () {
            self.isShowFriendRequestNotification = false;
            clearInterval(self.friendRequestNotificationInterval);
            self.friendRequestNotificationInterval = null;
        }, this.notificationDelay);
    }

    IsShowAddFriendRequestBtn = function (friendId: string) {
        var friendRequests = this.GetToolbarItem("friendRequests").content;

        if (friendId != this.user._id &&
            this.user.friends.indexOf(friendId) == -1 &&
            friendRequests.send.indexOf(friendId) == -1 &&
            friendRequests.get.indexOf(friendId) == -1) {
            return true;
        }
        else {
            return false;
        }
    }

    IsShowRemoveFriendRequestBtn = function (friendId: string) {
        var friendRequests = this.GetToolbarItem("friendRequests").content;

        if (friendRequests.send.indexOf(friendId) != -1) {
            return true;
        }
        else {
            return false;
        }
    }

    IsShowFriendRequestConfirmSector = function (friendId: string) {
        var friendRequests = this.GetToolbarItem("friendRequests").content;

        if (friendRequests.get.indexOf(friendId) != -1) {
            return true;
        }
        else {
            return false;
        }
    }

    AddFriendObjectToUser = function (data: any) {
        var friend = data.friend;
        var userFriends = this.user.friends;

        if (userFriends.indexOf(friend._id) == -1) {
            // Add the friend id to the user's friends array.
            userFriends.push(friend._id);
        }

        // Setting the new token on the client.
        setToken(data.token);

        // Add the friend client object to the friends array.
        this.friends.push(friend);
        this.socket.emit("ServerGetOnlineFriends", getToken());
        this.socket.emit("ServerFriendAddedUpdate", getToken(), friend._id);
    }

    AddFriend = function (friendId: string) {
        // Remove the friend request from all friend requests object.
        var friendRequests = this.GetToolbarItem("friendRequests").content;
        friendRequests.get.splice(friendRequests.get.indexOf(friendId));

        // Add the friend id to the user's friends array.
        var userFriends = this.user.friends;
        userFriends.push(friendId);

        var self = this;
        self.navbarService.AddFriend(friendId).then(function (result: any) {
            if (result) {
                self.socket.emit("ServerUpdateFriendRequests", getToken(), friendRequests);
                self.socket.emit("ServerAddFriend", getToken(), result);
            }
            else {
                //  Recover the actions in case the server is fail to add the friend. 
                friendRequests.get.push(friendId);
                userFriends.slice(userFriends.indexOf(friendId));
                self.socket.emit("ServerUpdateFriendRequests", getToken(), friendRequests);
            }
        });
    }

    IgnoreFriendRequest = function (friendId: string) {
        // Remove the friend request from all friend requests object.
        var friendRequests = this.GetToolbarItem("friendRequests").content;
        friendRequests.get.splice(friendRequests.get.indexOf(friendId));

        var self = this;
        this.navbarService.IgnoreFriendRequest(friendId).then(function (result: any) {
            if (result) {
                self.socket.emit("ServerUpdateFriendRequests", getToken(), friendRequests);
                self.socket.emit("ServerIgnoreFriendRequest", self.user._id, friendId);
            }
        });

    }
}

function GetResultsIds(results: Array<any>) {
    var profilesIds: Array<string> = [];
    var resultsIdsWithNoProfile: Array<string> = [];

    results.forEach(function (result) {
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