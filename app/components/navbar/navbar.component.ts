import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

import { GlobalService } from '../../services/global/global.service';
import { AuthService } from '../../services/auth/auth.service';
import { NavbarService } from '../../services/navbar/navbar.service';

export class DropMenuData {
    constructor(link: string, text: string, action: Function, object: any)
    { this.link = link, this.text = text, this.action = action, this.object = object }

    link: string;
    text: string;
    action: Function;
    object: any;
}

@Component({
    selector: 'navbar',
    templateUrl: './navbar.html',
    providers: [NavbarService]
})

export class NavbarComponent {
    constructor(private router: Router, private authService: AuthService,
        private globalService: GlobalService, private navbarService: NavbarService) {
        this.globalService.data.subscribe(value => {
            if (value["isOpenEditWindow"]) {
                this.ClosePopups();
            }
        });
    }

    @Input() name: Object;

    // START CONFIG VARIABLES //

    searchLimit: number = 4;
    searchInputChangeDelayMilliseconds: number = 200;

    // END CONFIG VARIABLES //

    isSidebarOpen: boolean = false;
    isDropMenuOpen: boolean = false;
    searchResults: Array<any> = [];
    isShowSearchResults: boolean = false;
    inputTimer: any = null;

    dropMenuDataList: DropMenuData[] = [
        new DropMenuData("#", "הגדרות", null, null),
        new DropMenuData("/login", "התנתקות", function (self: any, link: string) {
            self.authService.Logout().then(() => {
                self.router.navigateByUrl(link);
            });
        }, this)
    ];

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
                                    else {
                                        result.profile = null;
                                    }
                                });
                            }
                        });
                    }
                    else {
                        self.HideSearchResults();
                        self.searchResults = [];
                    }
                });
            }
            else {
                self.HideSearchResults();
                self.searchResults = [];
            }
        }, self.searchInputChangeDelayMilliseconds);
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