"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var router_1 = require("@angular/router");
var login_component_1 = require("./components/login/login.component");
var home_component_1 = require("./components/home/home.component");
var pageNotFound_component_1 = require("./components/pageNotFound/pageNotFound.component");
var auth_guard_1 = require("./components/login/auth.guard");
var appRoutes = [
    { path: '', component: home_component_1.HomeComponent, canActivate: [auth_guard_1.AuthGuard] },
    { path: 'login', component: login_component_1.LoginComponent },
    { path: '**', component: pageNotFound_component_1.PageNotFoundComponent }
];
exports.routing = router_1.RouterModule.forRoot(appRoutes);
//# sourceMappingURL=app.routing.js.map