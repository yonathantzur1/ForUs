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
var alert_service_1 = require("../../services/alert/alert.service");
var auth_service_1 = require("../../services/auth/auth.service");
var navbar_service_1 = require("../../services/navbar/navbar.service");
var DropMenuData = /** @class */ (function () {
    function DropMenuData(link, text, action, showFunction) {
        this.link = link;
        this.text = text;
        this.action = action;
        this.showFunction = showFunction ? showFunction : function () { return true; };
    }
    return DropMenuData;
}());
exports.DropMenuData = DropMenuData;
var NavbarComponent = /** @class */ (function () {
    function NavbarComponent(router, authService, globalService, alertService, navbarService) {
        var _this = this;
        this.router = router;
        this.authService = authService;
        this.globalService = globalService;
        this.alertService = alertService;
        this.navbarService = navbarService;
        this.friends = [];
        this.isFriendsLoading = false;
        this.isNewFriendsLabel = false;
        this.chatData = { "isOpen": false };
        // START message notification variables //
        this.isShowMessageNotification = false;
        // END message notification variables //
        // START friend-request notification variables //
        this.isShowFriendRequestNotification = false;
        // END friend-request notification variables //
        this.isChatsWindowOpen = false;
        this.isFriendRequestsWindowOpen = false;
        this.isSidenavOpen = false;
        this.isSidenavOpenFirstTime = false;
        this.searchResults = [];
        this.isShowSearchResults = false;
        // START CONFIG VARIABLES //
        this.searchInputChangeDelay = 220; // milliseconds
        this.notificationDelay = 3800; // milliseconds
        this.askForOnlineFriendsDelay = 60; // seconds
        this.chatTypingDelay = 1000; // milliseconds
        this.newFriendsLabelDelay = 4000; // milliseconds    
        this.sidenavWidth = "210px";
        // END CONFIG VARIABLES //
        // Search users cache objects
        this.searchCache = {};
        this.profilesCache = {};
        ;
        this.subscribeObj = this.globalService.data.subscribe(function (value) {
            // In case isOpenProfileEditWindow is true or false
            if (value["isOpenProfileEditWindow"] != null) {
                value["isOpenProfileEditWindow"] && _this.ClosePopups();
                _this.isOpenProfileEditWindow = value["isOpenProfileEditWindow"];
            }
            if (value["closeDropMenu"]) {
                _this.isDropMenuOpen = false;
            }
            if (value["openNewWindow"]) {
                _this.OpenNewWindow();
            }
        });
        var self = this;
        self.toolbarItems = [
            {
                id: "messages",
                icon: "material-icons",
                innerIconText: "mail_outline",
                title: "הודעות",
                content: {},
                getNotificationsNumber: function () {
                    var _this = this;
                    var counter = 0;
                    Object.keys(this.content).forEach(function (id) {
                        counter += _this.content[id].unreadMessagesNumber;
                    });
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
                icon: "material-icons",
                innerIconText: "people",
                title: "בקשות חברות",
                content: {
                    get: [],
                    send: []
                },
                getNotificationsNumber: function () {
                    return this.content.get.length;
                },
                isShowToolbarItemBadget: function () {
                    return (this.getNotificationsNumber() > 0);
                },
                onClick: function () {
                    self.ShowHideFriendRequestsWindow();
                }
            }
        ];
        self.dropMenuDataList = [
            new DropMenuData("/management", "ניהול", null, function () {
                return (self.globalService.userPermissions.indexOf(global_service_1.PERMISSION.ADMIN) != -1);
            }),
            new DropMenuData("#", "הגדרות", null),
            new DropMenuData("/login", "התנתקות", function (link) {
                self.globalService.Logout();
                self.router.navigateByUrl(link);
            })
        ];
    }
    NavbarComponent.prototype.ngOnInit = function () {
        this.globalService.socket.emit('login');
        var self = this;
        self.askForOnlineFriendsInterval = setInterval(function () {
            self.globalService.socket.emit("ServerGetOnlineFriends");
        }, self.askForOnlineFriendsDelay * 1000);
        self.LoadFriendsData(self.user.friends);
        // Loading user messages notifications.
        self.navbarService.GetUserMessagesNotifications().then(function (result) {
            var messagesNotifications = result.messagesNotifications ? result.messagesNotifications : {};
            self.GetToolbarItem("messages").content = messagesNotifications;
        });
        // Loading user friend requests.
        self.navbarService.GetUserFriendRequests().then(function (result) {
            self.GetToolbarItem("friendRequests").content = result.friendRequests;
        });
        self.globalService.SocketOn('LogoutUserSessionClient', function (msg) {
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
        self.globalService.SocketOn('GetMessage', function (msgData) {
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
                }
            }
        });
        self.globalService.SocketOn('ClientGetOnlineFriends', function (onlineFriendsIds) {
            if (onlineFriendsIds.length > 0) {
                self.friends.forEach(function (friend) {
                    if (onlineFriendsIds.indexOf(friend._id) != -1) {
                        friend.isOnline = true;
                    }
                });
            }
        });
        self.globalService.SocketOn('GetFriendConnectionStatus', function (statusObj) {
            self.friends.forEach(function (friend) {
                if (friend._id == statusObj.friendId) {
                    friend.isOnline = statusObj.isOnline;
                }
            });
        });
        self.globalService.SocketOn('ClientUpdateFriendRequests', function (friendRequests) {
            self.GetToolbarItem("friendRequests").content = friendRequests;
        });
        self.globalService.SocketOn('GetFriendRequest', function (friendId, friendFullName) {
            var friendRequests = self.GetToolbarItem("friendRequests").content;
            friendRequests.get.push(friendId);
            self.ShowFriendRequestNotification(friendFullName);
        });
        self.globalService.SocketOn('DeleteFriendRequest', function (friendId) {
            var friendRequests = self.GetToolbarItem("friendRequests").content;
            friendRequests.get.splice(friendRequests.get.indexOf(friendId), 1);
        });
        self.globalService.SocketOn('ClientIgnoreFriendRequest', function (friendId) {
            var friendRequests = self.GetToolbarItem("friendRequests").content;
            friendRequests.send.splice(friendRequests.send.indexOf(friendId), 1);
        });
        self.globalService.SocketOn('ClientAddFriend', function (friend) {
            self.AddFriendObjectToUser(friend);
        });
        self.globalService.SocketOn('ClientFriendAddedUpdate', function (friend) {
            self.authService.SetCurrUserToken().then(function (result) {
                if (result) {
                    self.globalService.RefreshSocket();
                    self.RemoveFriendRequest(friend._id, true);
                    self.user.friends.push(friend._id);
                    self.friends.push(friend);
                    self.globalService.socket.emit("ServerGetOnlineFriends");
                }
            });
        });
        self.globalService.SocketOn('ClientFriendTyping', function (friendId) {
            self.MakeFriendTyping(friendId);
        });
    };
    NavbarComponent.prototype.ngOnDestroy = function () {
        this.subscribeObj.unsubscribe();
        clearInterval(this.askForOnlineFriendsInterval);
    };
    NavbarComponent.prototype.IsShowFriendFindInput = function () {
        return $(".sidenav-body-sector").hasScrollBar();
    };
    NavbarComponent.prototype.AddMessageToToolbarMessages = function (msgData) {
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
    };
    NavbarComponent.prototype.RemoveFriendMessagesFromToolbarMessages = function (friendId) {
        var notificationsMessages = this.GetToolbarItem("messages").content;
        if (notificationsMessages[friendId]) {
            delete (notificationsMessages[friendId]);
            this.navbarService.RemoveMessagesNotifications(notificationsMessages);
        }
    };
    // Return item object from toolbar items array by its id.
    NavbarComponent.prototype.GetToolbarItem = function (id) {
        for (var i = 0; i < this.toolbarItems.length; i++) {
            if (this.toolbarItems[i].id == id) {
                return this.toolbarItems[i];
            }
        }
    };
    NavbarComponent.prototype.ShowMessageNotification = function (name, text, isImage, friendId) {
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
    };
    NavbarComponent.prototype.GetFriendNameById = function (id) {
        for (var i = 0; i < this.friends.length; i++) {
            if (this.friends[i]._id == id) {
                return (this.friends[i].firstName + " " + this.friends[i].lastName);
            }
        }
        return null;
    };
    NavbarComponent.prototype.GetFriendById = function (id) {
        for (var i = 0; i < this.friends.length; i++) {
            if (this.friends[i]._id == id) {
                return this.friends[i];
            }
        }
        return null;
    };
    NavbarComponent.prototype.MessageNotificationClicked = function () {
        // Turn off the open notification.
        this.isShowMessageNotification = false;
        if (this.messageNotificationInterval) {
            clearInterval(this.messageNotificationInterval);
            this.messageNotificationInterval = null;
        }
        this.OpenChat(this.GetFriendById(this.messageNotificationFriendId));
    };
    // Loading full friends objects to friends array.
    NavbarComponent.prototype.LoadFriendsData = function (friendsIds) {
        var _this = this;
        if (friendsIds.length > 0) {
            this.isFriendsLoading = true;
            this.navbarService.GetFriends(friendsIds).then(function (friendsResult) {
                _this.friends = friendsResult;
                _this.isFriendsLoading = false;
                _this.globalService.socket.emit("ServerGetOnlineFriends");
            });
        }
    };
    NavbarComponent.prototype.ShowHideSidenav = function () {
        this.isNewFriendsLabel = false;
        if (this.isSidenavOpen) {
            this.HideSidenav();
        }
        else {
            this.isSidenavOpen = true;
            this.isSidenavOpenFirstTime = true;
            this.HideDropMenu();
            this.HideSearchResults();
            document.getElementById("sidenav").style.width = this.sidenavWidth;
            $("#open-sidenav-btn").removeClass("close-sidenav");
        }
    };
    NavbarComponent.prototype.HideSidenav = function () {
        if (this.isSidenavOpen) {
            this.HideChatsWindow();
            this.HideFriendRequestsWindow();
            this.isSidenavOpen = false;
            document.getElementById("sidenav").style.width = "0";
            $("#open-sidenav-btn").addClass("close-sidenav");
        }
    };
    NavbarComponent.prototype.ShowHideDropMenu = function () {
        this.isDropMenuOpen = !this.isDropMenuOpen;
        if (this.isDropMenuOpen) {
            this.HideSidenav();
            this.HideSearchResults();
        }
    };
    NavbarComponent.prototype.HideDropMenu = function () {
        this.isDropMenuOpen = false;
    };
    NavbarComponent.prototype.ShowSearchResults = function () {
        this.isShowSearchResults = true;
        if (this.isShowSearchResults) {
            this.HideSidenav();
            this.HideDropMenu();
        }
    };
    NavbarComponent.prototype.HideSearchResults = function () {
        this.isShowSearchResults = false;
    };
    NavbarComponent.prototype.ClickSearchInput = function (input) {
        this.isShowSearchResults = input ? true : false;
        this.HideSidenav();
        this.HideDropMenu();
    };
    NavbarComponent.prototype.ClosePopups = function () {
        this.HideSidenav();
        this.HideDropMenu();
        this.HideSearchResults();
    };
    NavbarComponent.prototype.OverlayClicked = function () {
        if (this.isChatsWindowOpen || this.isFriendRequestsWindowOpen) {
            this.HideChatsWindow();
            this.HideFriendRequestsWindow();
        }
        else {
            this.ClosePopups();
        }
    };
    NavbarComponent.prototype.SearchChange = function (input) {
        this.isNewFriendsLabel = false;
        this.inputInterval && clearTimeout(this.inputInterval);
        var self = this;
        self.inputInterval = setTimeout(function () {
            if (input && (input = input.trim())) {
                var cachedUsers = self.GetSearchUsersFromCache(input);
                // In case cached users result found for this query input.
                if (cachedUsers) {
                    self.GetResultImagesFromCache(cachedUsers);
                    self.searchResults = cachedUsers;
                }
                // clear cached users (with full profiles) from memory.
                cachedUsers = null;
                self.navbarService.GetMainSearchResults(input).then(function (results) {
                    if (results && results.length > 0 && input == self.searchInput.trim()) {
                        self.InsertSearchUsersToCache(input, results);
                        self.GetResultImagesFromCache(results);
                        self.searchResults = results;
                        self.ShowSearchResults();
                        self.navbarService.GetMainSearchResultsWithImages(GetResultsIds(results)).then(function (profiles) {
                            if (profiles && Object.keys(profiles).length > 0 && input == self.searchInput.trim()) {
                                self.searchResults.forEach(function (result) {
                                    if (result.originalProfile) {
                                        result.profile = profiles[result.originalProfile];
                                    }
                                });
                                self.InsertResultsImagesToCache(profiles);
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
    };
    NavbarComponent.prototype.InsertResultsImagesToCache = function (profiles) {
        var self = this;
        Object.keys(profiles).forEach(function (profileId) {
            self.profilesCache[profileId] = profiles[profileId];
        });
    };
    NavbarComponent.prototype.GetResultImagesFromCache = function (results) {
        var self = this;
        results.forEach(function (result) {
            if (result.originalProfile && (self.profilesCache[result.originalProfile] != null)) {
                result.profile = self.profilesCache[result.originalProfile];
            }
        });
    };
    NavbarComponent.prototype.InsertSearchUsersToCache = function (searchInput, results) {
        var resultsClone = [];
        results.forEach(function (result) {
            resultsClone.push(Object.assign({}, result));
        });
        this.searchCache[searchInput] = resultsClone;
    };
    NavbarComponent.prototype.GetSearchUsersFromCache = function (searchInput) {
        return this.searchCache[searchInput];
    };
    NavbarComponent.prototype.GetFilteredSearchResults = function (searchInput) {
        if (!searchInput) {
            return this.searchResults;
        }
        else {
            searchInput = searchInput.trim();
            searchInput = searchInput.replace(/\\/g, '');
            this.searchResults = this.searchResults.filter(function (result) {
                return ((result.fullName.indexOf(searchInput) == 0) ||
                    (result.fullNameReversed.indexOf(searchInput) == 0));
            });
            return this.searchResults;
        }
    };
    NavbarComponent.prototype.GetFilteredFriends = function (friendSearchInput) {
        if (!friendSearchInput) {
            return this.friends;
        }
        else {
            friendSearchInput = friendSearchInput.trim();
            friendSearchInput = friendSearchInput.replace(/\\/g, '');
            return this.friends.filter(function (friend) {
                return (((friend.firstName + " " + friend.lastName).indexOf(friendSearchInput) == 0) ||
                    ((friend.lastName + " " + friend.firstName).indexOf(friendSearchInput) == 0));
            });
        }
    };
    NavbarComponent.prototype.GetFriendUnreadMessagesNumberText = function (friendId) {
        var friendNotificationsMessages = this.GetToolbarItem("messages").content[friendId];
        if (friendNotificationsMessages) {
            return "(" + friendNotificationsMessages.unreadMessagesNumber + ")";
        }
        else {
            return "";
        }
    };
    NavbarComponent.prototype.OpenChat = function (friend) {
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
    };
    NavbarComponent.prototype.ShowHideChatsWindow = function () {
        this.isChatsWindowOpen = !this.isChatsWindowOpen;
    };
    NavbarComponent.prototype.HideChatsWindow = function () {
        this.isChatsWindowOpen = false;
    };
    NavbarComponent.prototype.ShowHideFriendRequestsWindow = function () {
        this.isFriendRequestsWindowOpen = !this.isFriendRequestsWindowOpen;
    };
    NavbarComponent.prototype.HideFriendRequestsWindow = function () {
        this.isFriendRequestsWindowOpen = false;
    };
    NavbarComponent.prototype.AddFriendRequest = function (friendId) {
        var friendRequests = this.GetToolbarItem("friendRequests").content;
        friendRequests.send.push(friendId);
        var self = this;
        self.navbarService.AddFriendRequest(friendId).then(function (result) {
            if (result) {
                self.globalService.socket.emit("ServerUpdateFriendRequests", friendRequests);
                self.globalService.socket.emit("SendFriendRequest", friendId);
                $("#remove-friend-notification").snackbar("hide");
                $("#add-friend-notification").snackbar("show");
            }
        });
    };
    NavbarComponent.prototype.RemoveFriendRequest = function (friendId, isHideMessageText) {
        var friendRequests = this.GetToolbarItem("friendRequests").content;
        friendRequests.send.splice(friendRequests.send.indexOf(friendId), 1);
        var self = this;
        this.navbarService.RemoveFriendRequest(friendId).then(function (result) {
            if (result) {
                self.globalService.socket.emit("ServerUpdateFriendRequests", friendRequests);
                self.globalService.socket.emit("RemoveFriendRequest", self.user._id, friendId);
                $("#add-friend-notification").snackbar("hide");
                !isHideMessageText && $("#remove-friend-notification").snackbar("show");
            }
        });
    };
    NavbarComponent.prototype.ShowFriendRequestNotification = function (name) {
        this.friendRequestNotificationName = name;
        this.isShowFriendRequestNotification = true;
        var self = this;
        self.friendRequestNotificationInterval = setInterval(function () {
            self.isShowFriendRequestNotification = false;
            clearInterval(self.friendRequestNotificationInterval);
            self.friendRequestNotificationInterval = null;
        }, this.notificationDelay);
    };
    NavbarComponent.prototype.IsShowAddFriendRequestBtn = function (friendId) {
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
    };
    NavbarComponent.prototype.IsShowRemoveFriendRequestBtn = function (friendId) {
        var friendRequests = this.GetToolbarItem("friendRequests").content;
        if (friendRequests.send.indexOf(friendId) != -1) {
            return true;
        }
        else {
            return false;
        }
    };
    NavbarComponent.prototype.IsShowFriendRequestConfirmSector = function (friendId) {
        var friendRequests = this.GetToolbarItem("friendRequests").content;
        if (friendRequests.get.indexOf(friendId) != -1) {
            return true;
        }
        else {
            return false;
        }
    };
    NavbarComponent.prototype.AddFriendObjectToUser = function (friend) {
        var userFriends = this.user.friends;
        if (userFriends.indexOf(friend._id) == -1) {
            // Add the friend id to the user's friends array.
            userFriends.push(friend._id);
        }
        // Add the friend client object to the friends array.
        this.friends.push(friend);
        this.globalService.socket.emit("ServerGetOnlineFriends");
        this.globalService.socket.emit("ServerFriendAddedUpdate", friend._id);
    };
    NavbarComponent.prototype.AddFriend = function (friendId) {
        this.isFriendsLoading = true;
        // Remove the friend request from all friend requests object.
        var friendRequests = this.GetToolbarItem("friendRequests").content;
        friendRequests.get.splice(friendRequests.get.indexOf(friendId), 1);
        // Add the friend id to the user's friends array.
        var userFriends = this.user.friends;
        userFriends.push(friendId);
        var self = this;
        self.navbarService.AddFriend(friendId).then(function (friend) {
            self.isFriendsLoading = false;
            if (friend) {
                self.globalService.RefreshSocket();
                self.globalService.socket.emit("ServerUpdateFriendRequests", friendRequests);
                self.globalService.socket.emit("ServerAddFriend", friend);
            }
            else {
                //  Recover the actions in case the server is fail to add the friend. 
                friendRequests.get.push(friendId);
                userFriends.splice(userFriends.indexOf(friendId), 1);
                self.globalService.socket.emit("ServerUpdateFriendRequests", friendRequests);
            }
        });
    };
    NavbarComponent.prototype.IgnoreFriendRequest = function (friendId) {
        // Remove the friend request from all friend requests object.
        var friendRequests = this.GetToolbarItem("friendRequests").content;
        friendRequests.get.splice(friendRequests.get.indexOf(friendId), 1);
        var self = this;
        this.navbarService.IgnoreFriendRequest(friendId).then(function (result) {
            if (result) {
                self.globalService.socket.emit("ServerUpdateFriendRequests", friendRequests);
                self.globalService.socket.emit("ServerIgnoreFriendRequest", self.user._id, friendId);
            }
        });
    };
    NavbarComponent.prototype.MakeFriendTyping = function (friendId) {
        var friendObj = this.friends.find(function (friend) {
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
    };
    NavbarComponent.prototype.SearchNewFriends = function () {
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
    };
    NavbarComponent.prototype.CloseChatWindow = function () {
        this.chatData.isOpen = false;
    };
    NavbarComponent.prototype.NavigateMain = function () {
        this.ClosePopups();
        this.CloseChatWindow();
        this.searchInput = "";
        this.router.navigateByUrl('');
    };
    NavbarComponent.prototype.GetNotificationsNumber = function () {
        var notificationsAmount = 0;
        this.toolbarItems.forEach(function (item) {
            notificationsAmount += item.getNotificationsNumber();
        });
        return notificationsAmount;
    };
    NavbarComponent.prototype.OpenNewWindow = function () {
        this.ClosePopups();
        this.CloseChatWindow();
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", Object)
    ], NavbarComponent.prototype, "user", void 0);
    NavbarComponent = __decorate([
        core_1.Component({
            selector: 'navbar',
            templateUrl: './navbar.html',
            providers: [navbar_service_1.NavbarService]
        }),
        __metadata("design:paramtypes", [router_1.Router,
            auth_service_1.AuthService,
            global_service_1.GlobalService,
            alert_service_1.AlertService,
            navbar_service_1.NavbarService])
    ], NavbarComponent);
    return NavbarComponent;
}());
exports.NavbarComponent = NavbarComponent;
function GetResultsIds(results) {
    var profilesIds = [];
    var resultsIdsWithNoProfile = [];
    results.forEach(function (result) {
        var id = result.originalProfile;
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
//# sourceMappingURL=navbar.component.js.map