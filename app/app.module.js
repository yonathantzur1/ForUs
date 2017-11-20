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
// Components import
var app_component_1 = require("./components/app/app.component");
var login_component_1 = require("./components/login/login.component");
var loader_component_1 = require("./components/loader/loader.component");
var home_component_1 = require("./components/home/home.component");
var navbar_component_1 = require("./components/navbar/navbar.component");
var dropMenu_component_1 = require("./components/dropMenu/dropMenu.component");
var profile_component_1 = require("./components/profile/profile.component");
var profilePicture_component_1 = require("./components/profilePicture/profilePicture.component");
var chat_component_1 = require("./components/chat/chat.component");
var unreadWindow_component_1 = require("./components/unreadWindow/unreadWindow.component");
var friendRequestsWindow_component_1 = require("./components/friendRequestsWindow/friendRequestsWindow.component");
var pageNotFound_component_1 = require("./components/pageNotFound/pageNotFound.component");
var auth_service_1 = require("./services/auth/auth.service");
var auth_guard_1 = require("./components/login/auth.guard");
var app_routing_1 = require("./app.routing");
var global_service_1 = require("./services/global/global.service");
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
                app_component_1.AppComponent,
                login_component_1.LoginComponent,
                loader_component_1.LoaderComponent,
                home_component_1.HomeComponent,
                pageNotFound_component_1.PageNotFoundComponent,
                navbar_component_1.NavbarComponent,
                dropMenu_component_1.DropMenuComponent,
                profile_component_1.ProfileComponent,
                profilePicture_component_1.ProfilePictureComponent,
                chat_component_1.ChatComponent,
                unreadWindow_component_1.UnreadWindowComponent,
                friendRequestsWindow_component_1.FriendRequestsWindowComponent
            ],
            providers: [
                auth_guard_1.AuthGuard,
                auth_service_1.AuthService,
                global_service_1.GlobalService
            ],
            bootstrap: [app_component_1.AppComponent]
        })
    ], AppModule);
    return AppModule;
}());
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map