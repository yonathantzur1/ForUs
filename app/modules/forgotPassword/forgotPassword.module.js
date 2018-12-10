"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var forms_1 = require("@angular/forms");
var common_1 = require("@angular/common");
// Components
var forgotPassword_component_1 = require("./components/forgotPassword/forgotPassword.component");
// Routes
var forgotPassword_routing_1 = require("../../routes/forgotPassword/forgotPassword.routing");
var ForgotPasswordModule = /** @class */ (function () {
    function ForgotPasswordModule() {
    }
    ForgotPasswordModule = __decorate([
        core_1.NgModule({
            imports: [
                common_1.CommonModule,
                forms_1.FormsModule,
                forgotPassword_routing_1.ForgotPasswordRoutingModule
            ],
            declarations: [
                forgotPassword_component_1.ForgotPasswordComponent
            ]
        })
    ], ForgotPasswordModule);
    return ForgotPasswordModule;
}());
exports.ForgotPasswordModule = ForgotPasswordModule;
//# sourceMappingURL=forgotPassword.module.js.map