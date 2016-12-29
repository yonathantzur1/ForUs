import { Component, Input } from '@angular/core';

@Component({
    selector: 'navbar',
    templateUrl: 'views/navbar.html'
})

export class NavbarComponent {
    @Input() name: string
    isSidebarOpen: boolean = false;

    ShowHideSidenav = function () {
        this.isSidebarOpen = !this.isSidebarOpen;

        if (this.isSidebarOpen) {
            document.getElementById("sidenav").style.width = "215px";
        }
        else {
            document.getElementById("sidenav").style.width = "0";
        }
    }

    HideSidenav = function () {
        this.isSidebarOpen = false;
        document.getElementById("sidenav").style.width = "0";
    }
}
