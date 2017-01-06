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
var DropMenuComponent = (function () {
    function DropMenuComponent(router) {
        this.router = router;
        this.ActiveAction = function (action, object, link) {
            if (action) {
                action(object, link);
            }
            else {
                this.router.navigateByUrl(link);
            }
        };
    }
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Array)
    ], DropMenuComponent.prototype, "options", void 0);
    DropMenuComponent = __decorate([
        core_1.Component({
            selector: 'dropMenu',
            templateUrl: 'views/dropMenu.html',
            providers: []
        }), 
        __metadata('design:paramtypes', [router_1.Router])
    ], DropMenuComponent);
    return DropMenuComponent;
}());
exports.DropMenuComponent = DropMenuComponent;
//# sourceMappingURL=dropMenu.component.js.map