"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var platform_browser_1 = require("@angular/platform-browser");
var forms_1 = require("@angular/forms");
var http_1 = require("@angular/common/http");
// Pipes import
var sort_pipe_1 = require("./pipes/sort/sort.pipe");
// Components import
var app_component_1 = require("./components/app/app.component");
var alert_component_1 = require("./components/alert/alert.component");
var login_component_1 = require("./components/login/login.component");
var loaderSpinner_component_1 = require("./components/loaderSpinner/loaderSpinner.component");
var home_component_1 = require("./components/home/home.component");
var navbar_component_1 = require("./components/navbar/navbar.component");
var dropMenu_component_1 = require("./components/dropMenu/dropMenu.component");
var profile_component_1 = require("./components/profile/profile.component");
var profilePicture_component_1 = require("./components/profilePicture/profilePicture.component");
var chat_component_1 = require("./components/chat/chat.component");
var chatsWindow_component_1 = require("./components/navbar/chatsWindow/chatsWindow.component");
var friendRequestsWindow_component_1 = require("./components/navbar/friendRequestsWindow/friendRequestsWindow.component");
var management_component_1 = require("./components/management/management.component");
var pageNotFound_component_1 = require("./components/pageNotFound/pageNotFound.component");
var auth_guard_1 = require("./auth/auth.guard");
var auth_service_1 = require("./services/auth/auth.service");
var app_routing_1 = require("./app.routing");
var global_service_1 = require("./services/global/global.service");
var alert_service_1 = require("./services/alert/alert.service");
var AppModule = /** @class */ (function () {
    function AppModule() {
    }
    AppModule = __decorate([
        core_1.NgModule({
            imports: [
                platform_browser_1.BrowserModule,
                forms_1.FormsModule,
                http_1.HttpClientModule,
                app_routing_1.routing
            ],
            declarations: [
                // ---------Components---------
                app_component_1.AppComponent,
                alert_component_1.AlertComponent,
                login_component_1.LoginComponent,
                loaderSpinner_component_1.LoaderSpinnerComponent,
                home_component_1.HomeComponent,
                pageNotFound_component_1.PageNotFoundComponent,
                navbar_component_1.NavbarComponent,
                dropMenu_component_1.DropMenuComponent,
                profile_component_1.ProfileComponent,
                profilePicture_component_1.ProfilePictureComponent,
                chat_component_1.ChatComponent,
                chatsWindow_component_1.ChatsWindowComponent,
                friendRequestsWindow_component_1.FriendRequestsWindowComponent,
                management_component_1.ManagementComponent,
                // ---------Pipes---------
                sort_pipe_1.SortObjects
            ],
            providers: [
                auth_guard_1.AuthGuard,
                auth_guard_1.AdminAuthGuard,
                auth_service_1.AuthService,
                global_service_1.GlobalService,
                alert_service_1.AlertService
            ],
            bootstrap: [app_component_1.AppComponent]
        })
    ], AppModule);
    return AppModule;
}());
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map