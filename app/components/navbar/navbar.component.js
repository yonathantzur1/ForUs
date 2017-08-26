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
var DropMenuData = (function () {
    function DropMenuData(link, text, action, object) {
        this.link = link, this.text = text, this.action = action, this.object = object;
    }
    return DropMenuData;
}());
exports.DropMenuData = DropMenuData;
var Friend = (function () {
    function Friend() {
    }
    return Friend;
}());
exports.Friend = Friend;
var NavbarComponent = (function () {
    function NavbarComponent(router, authService, globalService, navbarService) {
        var _this = this;
        this.router = router;
        this.authService = authService;
        this.globalService = globalService;
        this.navbarService = navbarService;
        this.friends = [];
        this.isFriendsLoading = false;
        this.defaultProfileImage = "./app/components/profilePicture/pictures/empty-profile.png";
        this.isChatOpen = false;
        // START CONFIG VARIABLES //
        this.searchLimit = 4;
        this.searchInputChangeDelayMilliseconds = 100;
        // END CONFIG VARIABLES //
        this.isSidebarOpen = false;
        this.isDropMenuOpen = false;
        this.searchResults = [];
        this.isShowSearchResults = false;
        this.inputTimer = null;
        this.dropMenuDataList = [
            new DropMenuData("#", "הגדרות", null, null),
            new DropMenuData("/login", "התנתקות", function (self, link) {
                deleteToken();
                self.router.navigateByUrl(link);
            }, this)
        ];
        // Loading full friends objects to friends array.
        this.LoadFriendsData = function (friendsIds) {
            var _this = this;
            if (friendsIds.length > 0) {
                this.isFriendsLoading = true;
                this.navbarService.GetFriends(friendsIds).then(function (friendsResult) {
                    _this.friends = friendsResult;
                    _this.isFriendsLoading = false;
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
        };
        this.ClosePopups = function () {
            this.HideSidenav();
            this.HideDropMenu();
            this.HideSearchResults();
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
            }, self.searchInputChangeDelayMilliseconds);
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
        // START CHAT FUNCTIONS //
        this.CloseChat = function () {
            this.isChatOpen = false;
        };
        this.globalService.data.subscribe(function (value) {
            if (value["isOpenEditWindow"]) {
                _this.ClosePopups();
                _this.globalService.deleteData("isOpenEditWindow");
            }
        });
    }
    NavbarComponent.prototype.ngOnInit = function () {
        this.LoadFriendsData(this.user.friends);
        // var socket = io();
        // socket.emit('login', getToken());
        // socket.on('message', function (data: any) {
        //     console.log('message: ' + data);
        // });
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