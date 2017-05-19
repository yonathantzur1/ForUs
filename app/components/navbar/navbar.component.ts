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
    maxImagesInCacheAmount: number = 20;
    searchInputChangeDelayMilliseconds: number = 200;

    // END CONFIG VARIABLES //

    isSidebarOpen: boolean = false;
    isDropMenuOpen: boolean = false;
    searchResults: Array<any> = [];
    profilesCache: Object = {};
    isShowSearchResults: boolean = false;
    ImagesIdsInCache: Array<string> = [];
    imagesInCacheAmount: number = 0;
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

    ClickSearchInput = function (input: string) {
        this.isShowSearchResults = true;

        if (this.isShowSearchResults) {
            this.HideSidenav();
            this.HideDropMenu();
        }
    }

    HideSearchResults = function () {
        this.isShowSearchResults = false;
    }

    ClosePopups = function () {
        this.HideSidenav();
        this.HideDropMenu();
        this.HideSearchResults();
    }

    InsertResultsImagesToCache = function (results: Array<any>) {
        if (this.imagesInCacheAmount > this.maxImagesInCacheAmount) {
            for (var i = 0; i < this.ImagesIdsInCache.length; i++) {
                delete this.profilesCache[this.ImagesIdsInCache[i]];
            }

            this.imagesInCacheAmount = 0;
            this.ImagesIdsInCache = [];
        }

        for (var i = 0; i < results.length; i++) {
            if (results[i].profile) {
                if (this.profilesCache[results[i]._id] == null) {
                    this.ImagesIdsInCache.push(results[i]._id);
                    this.imagesInCacheAmount++;
                }

                this.profilesCache[results[i]._id] = results[i].profile;
            }
            else {
                this.profilesCache[results[i]._id] = false;
            }
        }
    }

    GetResultsImagesFromCache = function (results: Array<any>) {
        for (var i = 0; i < results.length; i++) {
            var profile = this.profilesCache[results[i]._id];

            if (profile) {
                results[i].profile = profile;
            }
            else if (profile == false) {
                results[i].profile = null;
            }
        }
    }



    SearchChange = function (input: string) {
        var self = this;

        if (self.inputTimer) {
            clearTimeout(self.inputTimer);
        }

        self.inputTimer = setTimeout(function () {
            
            input = input? input.trim(): input;

            if (input) {
                self.navbarService.GetMainSearchResults(input, self.searchLimit).then((results: Array<any>) => {
                    if (results && results.length > 0 && input == self.searchInput.trim()) {
                        self.searchResults = results;
                        self.GetResultsImagesFromCache(results);
                        self.isShowSearchResults = true;
                    }
                    else {
                        self.isShowSearchResults = false;
                        self.searchResults = [];
                    }
                });

                self.navbarService.GetMainSearchResultsWithImages(input, self.searchLimit).then((results: Array<any>) => {
                    if (results && results.length > 0 && input == self.searchInput.trim()) {
                        self.searchResults = results;
                        self.InsertResultsImagesToCache(results);
                    }
                });
            }
            else {
                self.isShowSearchResults = false;
                self.searchResults = [];
            }
        }, self.searchInputChangeDelayMilliseconds);
    }
}