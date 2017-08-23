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
    constructor(link: string, text: string, action: Function, object: any)
    { this.link = link, this.text = text, this.action = action, this.object = object }

    link: string;
    text: string;
    action: Function;
    object: any;
}

export class Friend {
    id: string;
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

    constructor(private router: Router, private authService: AuthService,
        private globalService: GlobalService, private navbarService: NavbarService) {
        this.globalService.data.subscribe(value => {
            if (value["isOpenEditWindow"]) {
                this.ClosePopups();
                this.globalService.deleteData("isOpenEditWindow");
            }
        });
    }

    ngOnInit() {
        this.LoadFriendsData(this.user.friends);
        // var socket = io();
        // var loginData = {
        //     id: this.user._id,
        //     token: getToken()
        // }

        // socket.emit('login', loginData);
        // socket.on('message', function (data: any) {
        //     console.log('message: ' + data);
        // });
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

    // Loading full friends objects to friends array.
    LoadFriendsData = function (friendsIds: Array<string>) {
        if (friendsIds.length > 0) {
            this.navbarService.GetFriends(friendsIds).then((friendsResult: Array<Friend>) => {
                this.friends = friendsResult;
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

            input = input ? input.trim() : input;

            if (input) {
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
        return this.searchResults.filter(function (result: any) {
            return (result.fullName.indexOf(searchInput) != -1);
        });
    }

    GetFilteredFriends = function (friendSearchInput: string): Array<any> {
        return this.friends.filter(function (friend: any) {
            return ((friend.firstName.indexOf(friendSearchInput) != -1) ||
                (friend.lastName.indexOf(friendSearchInput) != -1));
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