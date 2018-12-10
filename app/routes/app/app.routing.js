"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var router_1 = require("@angular/router");
var login_component_1 = require("../../components/login/login.component");
var home_component_1 = require("../../components/home/home.component");
var managementPanel_component_1 = require("../../components/managementPanel/managementPanel.component");
var management_component_1 = require("../../components/managementPanel/management/management.component");
var statistics_component_1 = require("../../components/managementPanel/statistics/statistics.component");
var usersReports_1 = require("../../components/managementPanel/usersReports/usersReports");
var userPage_component_1 = require("../../components/userPage/userPage.component");
var searchPage_component_1 = require("../../components/searchPage/searchPage.component");
var auth_guard_1 = require("../../guards/auth/auth.guard");
var rootAuth_guard_1 = require("../../guards/rootAuth/rootAuth.guard");
var login_guard_1 = require("../../guards/login/login.guard");
var routes = [
    {
        path: '',
        component: home_component_1.HomeComponent,
        children: [
            { path: 'panel', component: managementPanel_component_1.ManagementPanelComponent, canActivate: [rootAuth_guard_1.RootAuthGuard] },
            { path: 'management', component: management_component_1.ManagementComponent, canActivate: [rootAuth_guard_1.RootAuthGuard] },
            { path: 'management/:id', component: management_component_1.ManagementComponent, canActivate: [rootAuth_guard_1.RootAuthGuard] },
            { path: 'statistics', component: statistics_component_1.StatisticsComponent, canActivate: [rootAuth_guard_1.RootAuthGuard] },
            { path: 'reports', component: usersReports_1.UsersReportsComponent, canActivate: [rootAuth_guard_1.RootAuthGuard] },
            { path: 'profile/:id', component: userPage_component_1.UserPageComponent },
            { path: 'search/:name', component: searchPage_component_1.SearchPageComponent }
        ],
        canActivate: [auth_guard_1.AuthGuard]
    },
    { path: 'login', component: login_component_1.LoginComponent, canActivate: [login_guard_1.LoginGuard] },
    { path: 'forgot/:passToken', loadChildren: './app/modules/forgotPassword/forgotPassword.module#ForgotPasswordModule' },
    { path: 'page-not-found', loadChildren: './app/modules/pageNotFound/pageNotFound.module#PageNotFoundModule' },
    { path: '**', redirectTo: 'page-not-found' }
];
var Routing = /** @class */ (function () {
    function Routing() {
    }
    Routing = __decorate([
        core_1.NgModule({
            imports: [router_1.RouterModule.forRoot(routes)],
            exports: [router_1.RouterModule]
        })
    ], Routing);
    return Routing;
}());
exports.Routing = Routing;
//# sourceMappingURL=app.routing.js.map