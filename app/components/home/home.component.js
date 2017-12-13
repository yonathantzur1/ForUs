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
var profilePicture_service_1 = require("../../services/profilePicture/profilePicture.service");
var home_service_1 = require("../../services/home/home.service");
var HomeComponent = /** @class */ (function () {
    function HomeComponent(router, authService, profilePictureService, homeService, globalService) {
        var _this = this;
        this.router = router;
        this.authService = authService;
        this.profilePictureService = profilePictureService;
        this.homeService = homeService;
        this.globalService = globalService;
        this.isOpenProfileEditWindow = false;
        this.currUser = null;
        this.subscribeObj = this.globalService.data.subscribe(function (value) {
            if (value["isOpenProfileEditWindow"] == true ||
                value["isOpenProfileEditWindow"] == false) {
                _this.isOpenProfileEditWindow = value["isOpenProfileEditWindow"];
            }
        });
    }
    HomeComponent.prototype.ngOnInit = function () {
        var self = this;
        self.authService.GetCurrUser().then(function (result) {
            self.currUser = result;
        });
        self.profilePictureService.GetUserProfileImage().then(function (result) {
            if (result) {
                self.globalService.userProfileImage = result.image;
            }
            self.globalService.setData("userProfileImageLoaded", true);
        });
    };
    HomeComponent.prototype.ngOnDestroy = function () {
        this.subscribeObj.unsubscribe();
    };
    HomeComponent = __decorate([
        core_1.Component({
            selector: 'home',
            templateUrl: './home.html',
            providers: [home_service_1.HomeService, profilePicture_service_1.ProfilePictureService]
        }),
        __metadata("design:paramtypes", [router_1.Router,
            auth_service_1.AuthService,
            profilePicture_service_1.ProfilePictureService,
            home_service_1.HomeService,
            global_service_1.GlobalService])
    ], HomeComponent);
    return HomeComponent;
}());
exports.HomeComponent = HomeComponent;
//# sourceMappingURL=home.component.js.map