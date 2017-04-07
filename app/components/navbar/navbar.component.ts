import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth/auth.service';

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
    templateUrl: './navbar.html'
})

export class NavbarComponent {
    constructor(private router: Router, private authService: AuthService) { }

    @Input() name: string;

    isSidebarOpen: boolean = false;
    isDropMenuOpen: boolean = false;

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
}
