import { Component, Input } from '@angular/core';

export class DropMenuData {
    constructor(link: string, text: string) { this.link = link, this.text = text }
    link: string;
    text: string;
}

@Component({
    selector: 'navbar',
    templateUrl: 'views/navbar.html'
})

export class NavbarComponent {
    @Input() name: string;

    isSidebarOpen: boolean = false;
    isDropMenuOpen: boolean = false;

    dropMenuDataList: DropMenuData[] = [
        new DropMenuData("#", "הגדרות"),
        new DropMenuData("#", "התנתקות")
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
