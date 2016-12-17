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
var core_1 = require('@angular/core');
var router_1 = require('@angular/router');
var auth_service_1 = require('../../services/auth/auth.service');
var AuthGuardLogin = (function () {
    function AuthGuardLogin(router, authService) {
        this.router = router;
        this.authService = authService;
    }
    AuthGuardLogin.prototype.canActivate = function () {
        var _this = this;
        return this.authService.IsUserOnSession().then(function (result) {
            if (result == true) {
                _this.router.navigate(['']);
                return false;
            }
            else {
                return true;
            }
        });
    };
    AuthGuardLogin = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [router_1.Router, auth_service_1.AuthService])
    ], AuthGuardLogin);
    return AuthGuardLogin;
}());
exports.AuthGuardLogin = AuthGuardLogin;
//# sourceMappingURL=auth.guard.login.js.map