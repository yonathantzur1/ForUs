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
var userPage_service_1 = require("../../services/userPage/userPage.service");
var UserPageComponent = /** @class */ (function () {
    function UserPageComponent(route, userPageService, globalService) {
        var _this = this;
        this.route = route;
        this.userPageService = userPageService;
        this.globalService = globalService;
        this.subscribeObj = this.globalService.data.subscribe(function (value) {
            if (value["newUploadedImage"]) {
                if (!_this.user.profileImage) {
                    _this.user.profileImage = {};
                }
                _this.user.profileImage.image = value["newUploadedImage"];
            }
            if (value["isImageDeleted"]) {
                delete _this.user.profileImage;
            }
        });
        var self = this;
        self.options = [
            {
                id: "addFriend",
                iconCalc: function () {
                    return (self.user && self.user.isFriend) ? "fa fa-user-times" : "fa fa-user-plus";
                },
                innerIconText: "",
                onClick: function () {
                }
            },
            {
                id: "openChat",
                icon: "fa fa-pencil-square-o",
                innerIconText: "",
                onClick: function () {
                }
            },
            {
                id: "wave",
                icon: "fa fa-hand-paper-o",
                innerIconText: "",
                onClick: function () {
                }
            },
            {
                id: "menu",
                icon: "material-icons",
                innerIconText: "menu",
                onClick: function () {
                }
            }
        ];
    }
    UserPageComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.route.params.subscribe(function (params) {
            _this.userPageService.GetUserDetails(params["id"]).then(function (user) {
                user && _this.InitializePage(user);
            });
        });
    };
    UserPageComponent.prototype.ngOnDestroy = function () {
        this.subscribeObj.unsubscribe();
    };
    UserPageComponent.prototype.InitializePage = function (user) {
        this.globalService.setData("changeSearchInput", user.firstName + " " + user.lastName);
        this.user = user;
    };
    // Return true if the user page belongs to the current user.
    UserPageComponent.prototype.IsUserPageSelf = function () {
        return (this.user && this.user.uid == getCookie(this.globalService.uidCookieName));
    };
    UserPageComponent.prototype.OpenEditWindow = function () {
        if (this.IsUserPageSelf()) {
            this.globalService.setData("openProfileEditWindow", true);
        }
    };
    UserPageComponent = __decorate([
        core_1.Component({
            selector: 'userPage',
            templateUrl: './userPage.html',
            providers: [userPage_service_1.UserPageService]
        }),
        __metadata("design:paramtypes", [router_1.ActivatedRoute,
            userPage_service_1.UserPageService,
            global_service_1.GlobalService])
    ], UserPageComponent);
    return UserPageComponent;
}());
exports.UserPageComponent = UserPageComponent;
//# sourceMappingURL=userPage.component.js.map