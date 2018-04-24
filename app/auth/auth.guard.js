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
var Observable_1 = require("rxjs/Observable");
var core_1 = require("@angular/core");
var router_1 = require("@angular/router");
var auth_service_1 = require("../services/auth/auth.service");
var global_service_1 = require("../services/global/global.service");
var AuthGuard = /** @class */ (function () {
    function AuthGuard(router, authService, globalService) {
        this.router = router;
        this.authService = authService;
        this.globalService = globalService;
    }
    AuthGuard.prototype.canActivate = function (route, state) {
        var _this = this;
        return this.authService.IsUserOnSession().then(function (result) {
            if (result) {
                _this.globalService.Initialize();
                return true;
            }
            else {
                _this.router.navigateByUrl('/login');
                return false;
            }
        });
    };
    AuthGuard = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [router_1.Router, auth_service_1.AuthService, global_service_1.GlobalService])
    ], AuthGuard);
    return AuthGuard;
}());
exports.AuthGuard = AuthGuard;
var LoginGuard = /** @class */ (function () {
    function LoginGuard(router, authService, globalService) {
        this.router = router;
        this.authService = authService;
        this.globalService = globalService;
    }
    LoginGuard.prototype.canActivate = function (route, state) {
        var _this = this;
        return Observable_1.Observable.create(function (observer) {
            if (!getCookie(_this.globalService.uidCookieName)) {
                observer.next(true);
            }
            else {
                _this.authService.IsUserOnSession().then(function (result) {
                    if (!result) {
                        observer.next(true);
                    }
                    else {
                        _this.router.navigateByUrl('/');
                        observer.next(false);
                    }
                });
            }
        });
    };
    LoginGuard = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [router_1.Router, auth_service_1.AuthService, global_service_1.GlobalService])
    ], LoginGuard);
    return LoginGuard;
}());
exports.LoginGuard = LoginGuard;
var AdminAuthGuard = /** @class */ (function () {
    function AdminAuthGuard(router, authService, globalService) {
        this.router = router;
        this.authService = authService;
        this.globalService = globalService;
    }
    AdminAuthGuard.prototype.canActivate = function (route, state) {
        var _this = this;
        return this.authService.IsUserAdmin().then(function (result) {
            if (result) {
                return true;
            }
            else {
                _this.router.navigateByUrl('/page-not-found');
                return false;
            }
        });
    };
    AdminAuthGuard = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [router_1.Router, auth_service_1.AuthService, global_service_1.GlobalService])
    ], AdminAuthGuard);
    return AdminAuthGuard;
}());
exports.AdminAuthGuard = AdminAuthGuard;
//# sourceMappingURL=auth.guard.js.map