"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var router_1 = require("@angular/router");
var login_component_1 = require("./components/login/login.component");
var home_component_1 = require("./components/home/home.component");
var management_component_1 = require("./components/management/management.component");
var userPage_component_1 = require("./components/userPage/userPage.component");
var pageNotFound_component_1 = require("./components/pageNotFound/pageNotFound.component");
var auth_guard_1 = require("./auth/auth.guard");
var routes = [
    {
        path: '',
        component: home_component_1.HomeComponent,
        children: [
            { path: 'management', component: management_component_1.ManagementComponent, canActivate: [auth_guard_1.AdminAuthGuard] },
            { path: 'page-not-found', component: pageNotFound_component_1.PageNotFoundComponent },
            { path: 'profile/:id', component: userPage_component_1.UserPageComponent }
        ],
        canActivate: [auth_guard_1.AuthGuard]
    },
    { path: 'login', component: login_component_1.LoginComponent, canActivate: [auth_guard_1.LoginGuard] },
    { path: '**', redirectTo: 'page-not-found' }
];
exports.Routing = router_1.RouterModule.forRoot(routes);
//# sourceMappingURL=app.routing.js.map