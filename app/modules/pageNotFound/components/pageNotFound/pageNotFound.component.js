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
var core_1 = require("@angular/core");
var router_1 = require("@angular/router");
var PageNotFoundComponent = /** @class */ (function () {
    function PageNotFoundComponent(router) {
        this.router = router;
        this.numOfMonsters = 9;
        this.monsterImagePath = null;
    }
    PageNotFoundComponent.prototype.ngOnInit = function () {
        this.monsterImagePath = "./app/pictures/monsters/" + this.GetRandomMonsterPath();
    };
    PageNotFoundComponent.prototype.GetRandomMonsterPath = function () {
        // Rundom monster number.
        var imageNumber = Math.floor(Math.random() * this.numOfMonsters) + 1;
        return ("monster" + imageNumber + ".png");
    };
    PageNotFoundComponent.prototype.MainRoute = function () {
        this.router.navigateByUrl('/');
    };
    PageNotFoundComponent = __decorate([
        core_1.Component({
            selector: 'pageNotFound',
            templateUrl: './pageNotFound.html'
        }),
        __metadata("design:paramtypes", [router_1.Router])
    ], PageNotFoundComponent);
    return PageNotFoundComponent;
}());
exports.PageNotFoundComponent = PageNotFoundComponent;
//# sourceMappingURL=pageNotFound.component.js.map