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
var auth_service_1 = require("../../services/auth/auth.service");
var navbar_service_1 = require("../../services/navbar/navbar.service");
var DropMenuData = /** @class */ (function () {
    function DropMenuData(link, text, action, object) {
        this.link = link, this.text = text, this.action = action, this.object = object;
    }
    return DropMenuData;
}());
exports.DropMenuData = DropMenuData;
var Friend = /** @class */ (function () {
    function Friend() {
    }
    return Friend;
}());
exports.Friend = Friend;
var toolbarItem = /** @class */ (function () {
    function toolbarItem() {
    }
    return toolbarItem;
}());
exports.toolbarItem = toolbarItem;
var NavbarComponent = /** @class */ (function () {
    // END CONFIG VARIABLES //
    function NavbarComponent(router, authService, globalService, navbarService) {
        var _this = this;
        this.router = router;
        this.authService = authService;
        this.globalService = globalService;
        this.navbarService = navbarService;
        this.friends = [];
        this.isFriendsLoading = false;
        this.defaultProfileImage = "./app/components/profilePicture/pictures/empty-profile.png";
        this.chatData = { "isOpen": false };
        this.isShowMessageNotification = false;
        this.isUnreadWindowOpen = false;
        this.isSidebarOpen = false;
        this.isDropMenuOpen = false;
        this.searchResults = [];
        this.isShowSearchResults = false;
        this.inputTimer = null;
        // START CONFIG VARIABLES //
        this.searchLimit = 4;
        this.searchInputChangeDelay = 120; // In milliseconds
        this.messageNotificationTime = 3500; // In milliseconds
        this.IsShowToolbarItemBadget = function (item) {
            return (Object.keys(item.content).length > 0);
        };
        this.IsShowFriendFindInput = function () {
            return $(".slidenav-body-sector").hasScrollBar();
        };
        this.AddMessageToToolbarMessages = function (msgData) {
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
        this.RemoveFriendMessagesFromToolbarMessages = function (friendId) {
            var notificationsMessages = this.GetToolbarItem("messages").content;
            if (notificationsMessages[friendId]) {
                delete (notificationsMessages[friendId]);
                this.navbarService.RemoveMessagesNotifications(notificationsMessages);
            }
        };
        // Return item object from toolbar items array by its id.
        this.GetToolbarItem = function (id) {
            for (var i = 0; i < this.toolbarItems.length; i++) {
                if (this.toolbarItems[i].id == id) {
                    return this.toolbarItems[i];
                }
            }
        };
        this.ShowMessageNotification = function (name, text, friendId) {
            if (name && text) {
                this.messageNotificationName = name;
                this.messageNotificationText = text;
                this.messageNotificationFriendId = friendId;
                this.isShowMessageNotification = true;
                var self = this;
                self.notificationInterval = setInterval(function () {
                    self.isShowMessageNotification = false;
                    clearInterval(self.notificationInterval);
                    self.notificationInterval = null;
                }, this.messageNotificationTime);
            }
        };
        this.GetFriendNameById = function (id) {
            for (var i = 0; i < this.friends.length; i++) {
                if (this.friends[i]._id == id) {
                    return (this.friends[i].firstName + " " + this.friends[i].lastName);
                }
            }
            return null;
        };
        this.GetFriendById = function (id) {
            for (var i = 0; i < this.friends.length; i++) {
                if (this.friends[i]._id == id) {
                    return this.friends[i];
                }
            }
            return null;
        };
        this.MessageNotificationClicked = function () {
            // Turn off the open notification.
            this.isShowMessageNotification = false;
            if (this.notificationInterval) {
                clearInterval(this.notificationInterval);
                this.notificationInterval = null;
            }
            this.OpenChat(this.GetFriendById(this.messageNotificationFriendId));
        };
        // Loading full friends objects to friends array.
        this.LoadFriendsData = function (friendsIds) {
            var _this = this;
            if (friendsIds.length > 0) {
                this.isFriendsLoading = true;
                this.navbarService.GetFriends(friendsIds).then(function (friendsResult) {
                    _this.friends = friendsResult;
                    _this.isFriendsLoading = false;
                    _this.socket.emit("ServerGetOnlineFriends", getToken());
                });
            }
        };
        this.ShowHideSidenav = function () {
            this.isSidebarOpen = !this.isSidebarOpen;
            if (this.isSidebarOpen) {
                this.HideDropMenu();
                this.HideSearchResults();
                document.getElementById("sidenav").style.width = "210px";
            }
            else {
                this.HideUnreadWindow();
                document.getElementById("sidenav").style.width = "0";
            }
        };
        this.HideSidenav = function () {
            this.isSidebarOpen = false;
            document.getElementById("sidenav").style.width = "0";
        };
        this.ShowHideDropMenu = function () {
            this.isDropMenuOpen = !this.isDropMenuOpen;
            if (this.isDropMenuOpen) {
                this.HideSidenav();
                this.HideSearchResults();
                this.HideUnreadWindow();
            }
        };
        this.HideDropMenu = function () {
            this.isDropMenuOpen = false;
        };
        this.ShowSearchResults = function () {
            this.isShowSearchResults = true;
            if (this.isShowSearchResults) {
                this.HideSidenav();
                this.HideDropMenu();
            }
        };
        this.HideSearchResults = function () {
            this.isShowSearchResults = false;
        };
        this.ClickSearchInput = function (input) {
            this.isShowSearchResults = input ? true : false;
            this.HideSidenav();
            this.HideDropMenu();
            this.HideUnreadWindow();
        };
        this.ClosePopups = function () {
            if (this.isUnreadWindowOpen) {
                this.HideUnreadWindow();
            }
            else {
                this.HideSidenav();
                this.HideDropMenu();
                this.HideSearchResults();
            }
        };
        this.SearchChange = function (input) {
            var self = this;
            if (self.inputTimer) {
                clearTimeout(self.inputTimer);
            }
            self.inputTimer = setTimeout(function () {
                if (input) {
                    input = input.trim();
                    self.navbarService.GetMainSearchResults(input, self.searchLimit).then(function (results) {
                        if (results && results.length > 0 && input == self.searchInput.trim()) {
                            self.searchResults = results;
                            self.ShowSearchResults();
                            self.navbarService.GetMainSearchResultsWithImages(GetResultsIds(results)).then(function (profiles) {
                                if (profiles && Object.keys(profiles).length > 0 && input == self.searchInput.trim()) {
                                    self.searchResults.forEach(function (result) {
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
        };
        this.GetFilteredSearchResults = function (searchInput) {
            if (!searchInput) {
                return this.searchResults;
            }
            else {
                searchInput = searchInput.trim();
                return this.searchResults.filter(function (result) {
                    return ((result.fullName.indexOf(searchInput) == 0) ||
                        ((result.lastName + " " + result.firstName).indexOf(searchInput) == 0));
                });
            }
        };
        this.GetFilteredFriends = function (friendSearchInput) {
            if (!friendSearchInput) {
                return this.friends;
            }
            else {
                friendSearchInput = friendSearchInput.trim();
                return this.friends.filter(function (friend) {
                    return (((friend.firstName + " " + friend.lastName).indexOf(friendSearchInput) == 0) ||
                        ((friend.lastName + " " + friend.firstName).indexOf(friendSearchInput) == 0));
                });
            }
        };
        this.GetFriendUnreadMessagesNumberText = function (friendId) {
            var friendNotificationsMessages = this.GetToolbarItem("messages").content[friendId];
            if (friendNotificationsMessages) {
                return "(" + friendNotificationsMessages.unreadMessagesNumber + ")";
            }
            else {
                return "";
            }
        };
        this.OpenChat = function (friend) {
            this.HideSidenav();
            this.HideUnreadWindow();
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
        };
        this.HideUnreadWindow = function () {
            this.isUnreadWindowOpen = false;
        };
        this.socket = globalService.socket;
        this.globalService.data.subscribe(function (value) {
            if (value["isOpenProfileEditWindow"]) {
                _this.ClosePopups();
                _this.globalService.deleteData("isOpenProfileEditWindow");
            }
        });
        var self = this;
        self.toolbarItems = [
            {
                id: "messages",
                icon: "fa fa-envelope-o",
                title: "הודעות",
                content: {},
                onClick: function () {
                    self.isUnreadWindowOpen = !self.isUnreadWindowOpen;
                }
            },
            {
                id: "friendRequests",
                icon: "fa fa-user-plus",
                title: "בקשות חברות",
                content: {},
                onClick: function () {
                }
            }
        ];
        self.dropMenuDataList = [
            new DropMenuData("#", "הגדרות", null, null),
            new DropMenuData("/login", "התנתקות", function (self, link) {
                deleteToken();
                self.globalService.GenerateNewSocket();
                self.router.navigateByUrl(link);
            }, self)
        ];
    }
    NavbarComponent.prototype.ngOnInit = function () {
        this.socket.emit('login', getToken());
        var self = this;
        self.LoadFriendsData(self.user.friends);
        // Loading user messages notifications.
        self.navbarService.GetUserMessagesNotifications().then(function (result) {
            var messagesNotifications = result.messagesNotifications ? result.messagesNotifications : {};
            self.GetToolbarItem("messages").content = messagesNotifications;
        });
        self.socket.on('GetMessage', function (msgData) {
            if (!self.chatData.isOpen || msgData.from != self.chatData.friend._id) {
                self.AddMessageToToolbarMessages(msgData);
                if (!self.chatData.isOpen) {
                    // Turn off the open notification.
                    self.isShowMessageNotification = false;
                    if (self.notificationInterval) {
                        clearInterval(self.notificationInterval);
                        self.notificationInterval = null;
                    }
                    self.ShowMessageNotification(self.GetFriendNameById(msgData.from), msgData.text, msgData.from);
                }
            }
        });
        self.socket.on('ClientGetOnlineFriends', function (onlineFriendsIds) {
            if (onlineFriendsIds.length > 0) {
                self.friends.forEach(function (friend) {
                    if (onlineFriendsIds.indexOf(friend._id) != -1) {
                        friend.isOnline = true;
                    }
                });
            }
        });
        self.socket.on('GetFriendConnectionStatus', function (statusObj) {
            self.friends.forEach(function (friend) {
                if (friend._id == statusObj.friendId) {
                    friend.isOnline = statusObj.isOnline;
                }
            });
        });
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
        __metadata("design:paramtypes", [router_1.Router, auth_service_1.AuthService,
            global_service_1.GlobalService, navbar_service_1.NavbarService])
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