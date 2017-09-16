import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

import { GlobalService } from '../../services/global/global.service';
import { AuthService } from '../../services/auth/auth.service';
import { NavbarService } from '../../services/navbar/navbar.service';

declare var getToken: any;
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
    messageNotificationName: string;
    messageNotificationText: string;
    isShowMessageNotification: boolean = false;
    messageNotificationTime: number = 2000; // In milliseconds

    toolbarItems = [
        {
            id: "messages",
            icon: "fa fa-envelope-o",
            title: "הודעות",
            number: 0
        },
        {
            id: "notifications",
            icon: "fa fa-bell-o",
            title: "התראות",
            number: 0
        }
    ];

    constructor(private router: Router, private authService: AuthService,
        private globalService: GlobalService, private navbarService: NavbarService) {
        this.socket = globalService.socket;

        this.globalService.data.subscribe(value => {
            if (value["isOpenProfileEditWindow"]) {
                this.ClosePopups();
                this.globalService.deleteData("isOpenProfileEditWindow");
            }

            if (value["logout"] && this.socket) {
                this.socket.emit('logout');
                this.globalService.deleteData("logout");
            }
        });
    }

    ngOnInit() {
        this.LoadFriendsData(this.user.friends);
        this.socket.emit('login', getToken());

        var self = this;

        self.socket.on('GetMessage', function (msgData: any) {
            if (!self.chatData.isOpen || msgData.from != self.chatData.friend._id) {
                self.GetToolbarItem("messages").number++;

                if (!self.chatData.isOpen) {
                    self.ShowMessageNotification(self.GetFriendNameById(msgData.from), msgData.text);
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
    }

    // START CONFIG VARIABLES //

    searchLimit: number = 4;
    searchInputChangeDelayMilliseconds: number = 100;

    // END CONFIG VARIABLES //

    isSidebarOpen: boolean = false;
    isDropMenuOpen: boolean = false;
    searchResults: Array<any> = [];
    isShowSearchResults: boolean = false;
    inputTimer: any = null;

    dropMenuDataList: DropMenuData[] = [
        new DropMenuData("#", "הגדרות", null, null),
        new DropMenuData("/login", "התנתקות", function (self: any, link: string) {
            deleteToken();
            self.router.navigateByUrl(link);
        }, this)
    ];

    // Return item object from toolbar items array by its id.
    GetToolbarItem = function (id: string) {
        for (var i = 0; i < this.toolbarItems.length; i++) {
            if (this.toolbarItems[i].id == id) {
                return this.toolbarItems[i];
            }
        }
    }

    ShowMessageNotification = function (name: string, text: string) {
        if (name && text) {
            this.messageNotificationName = name;
            this.messageNotificationText = text;
            this.isShowMessageNotification = true;

            var self = this;
            var notificationInterval = setInterval(function () {
                self.isShowMessageNotification = false;
                clearInterval(notificationInterval);
            }, this.messageNotificationTime);
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
            document.getElementById("sidenav").style.width = "0";
        }
    }

    HideSidenav = function () {
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

    SearchChange = function (input: string) {
        var self = this;

        if (self.inputTimer) {
            clearTimeout(self.inputTimer);
        }

        self.inputTimer = setTimeout(function () {
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
        }, self.searchInputChangeDelayMilliseconds);
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

    OpenChat = function (friend: Friend) {
        this.HideSidenav();

        if (!this.chatData.isOpen || !this.chatData.friend || this.chatData.friend._id != friend._id) {
            // Put default profile in case the friend has no profile image.
            if (!friend.profileImage) {
                friend.profileImage = this.defaultProfileImage;
            }

            this.chatData.friend = friend;
            this.chatData.user = this.user;
            this.chatData.isOpen = true;

            this.globalService.setData("chatData", this.chatData);
        }
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