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

    isSidebarOpen: boolean = false;
    isDropMenuOpen: boolean = false;
    searchResults: Array<any> = [];
    isShowSearchResult = false;

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
        }
    }

    HideDropMenu = function () {
        this.isDropMenuOpen = false;
    }

    ClosePopups = function () {
        this.HideSidenav();
        this.HideDropMenu();
    }

    SearchChange = function (input: string) {
        input = input.trim();
        
        if (input) {
            this.navbarService.GetMainSearchResults(input).then((results: Array<any>) => {
                if (results && results.length > 0 && input == this.searchInput.trim()) {
                    this.searchResults = results;
                    this.isShowSearchResults = true;
                }
            });
        }
        else {
            this.isShowSearchResults = false;
            this.searchResults = [];
        }
    }
}
