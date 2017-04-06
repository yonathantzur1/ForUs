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
var auth_service_1 = require("../../services/auth/auth.service");
var home_service_1 = require("../../services/home/home.service");
var HomeComponent = (function () {
    function HomeComponent(router, authService, homeService) {
        this.router = router;
        this.authService = authService;
        this.homeService = homeService;
        this.isOpen = false;
        this.currUserName = "";
    }
    HomeComponent.prototype.ngOnInit = function () {
        this.GetCurrUserName();
    };
    HomeComponent.prototype.GetCurrUserName = function () {
        var _this = this;
        this.authService.GetCurrUserName().then(function (result) {
            _this.currUserName = result._body;
        });
    };
    HomeComponent.prototype.openPhoto = function () {
        this.isOpen = !this.isOpen;
    };
    return HomeComponent;
}());
HomeComponent = __decorate([
    core_1.Component({
        selector: 'home',
        templateUrl: 'views/home.html',
        providers: [home_service_1.HomeService]
    }),
    __metadata("design:paramtypes", [router_1.Router, auth_service_1.AuthService, home_service_1.HomeService])
], HomeComponent);
exports.HomeComponent = HomeComponent;
//# sourceMappingURL=home.component.js.map