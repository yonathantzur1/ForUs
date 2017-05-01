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
var NavbarComponent = (function () {
    function NavbarComponent(router, authService, globalService, navbarService) {
        var _this = this;
        this.router = router;
        this.authService = authService;
        this.globalService = globalService;
        this.navbarService = navbarService;
        this.isSidebarOpen = false;
        this.isDropMenuOpen = false;
        this.searchResults = [];
        this.isShowSearchResult = false;
        this.dropMenuDataList = [
            new DropMenuData("#", "הגדרות", null, null),
            new DropMenuData("/login", "התנתקות", function (self, link) {
                self.authService.Logout().then(function () {
                    self.router.navigateByUrl(link);
                });
            }, this)
        ];
        this.ShowHideSidenav = function () {
            this.isSidebarOpen = !this.isSidebarOpen;
            if (this.isSidebarOpen) {
                this.HideDropMenu();
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
            }
        };
        this.HideDropMenu = function () {
            this.isDropMenuOpen = false;
        };
        this.ClosePopups = function () {
            this.HideSidenav();
            this.HideDropMenu();
        };
        this.SearchChange = function (input) {
            var _this = this;
            input = input.trim();
            if (input) {
                this.navbarService.GetMainSearchResults(input).then(function (results) {
                    if (results && results.length > 0 && input == _this.searchInput.trim()) {
                        _this.searchResults = results;
                        _this.isShowSearchResults = true;
                    }
                });
            }
            else {
                this.isShowSearchResults = false;
                this.searchResults = [];
            }
        };
        this.globalService.data.subscribe(function (value) {
            if (value["isOpenEditWindow"]) {
                _this.ClosePopups();
            }
        });
    }
    return NavbarComponent;
}());
__decorate([
    core_1.Input(),
    __metadata("design:type", Object)
], NavbarComponent.prototype, "name", void 0);
NavbarComponent = __decorate([
    core_1.Component({
        selector: 'navbar',
        templateUrl: './navbar.html',
        providers: [navbar_service_1.NavbarService]
    }),
    __metadata("design:paramtypes", [router_1.Router, auth_service_1.AuthService,
        global_service_1.GlobalService, navbar_service_1.NavbarService])
], NavbarComponent);
exports.NavbarComponent = NavbarComponent;
//# sourceMappingURL=navbar.component.js.map