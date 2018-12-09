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
var pageNotFound_component_1 = require("../../components/pageNotFound/pageNotFound.component");
var routes = [
    {
        path: '',
        component: pageNotFound_component_1.PageNotFoundComponent
    }
];
var PageNotFoundRoutingModule = /** @class */ (function () {
    function PageNotFoundRoutingModule() {
    }
    PageNotFoundRoutingModule = __decorate([
        core_1.NgModule({
            imports: [router_1.RouterModule.forChild(routes)],
            exports: [router_1.RouterModule]
        })
    ], PageNotFoundRoutingModule);
    return PageNotFoundRoutingModule;
}());
exports.PageNotFoundRoutingModule = PageNotFoundRoutingModule;
//# sourceMappingURL=pageNotFound.routing.js.map