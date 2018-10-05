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
var searchPage_service_1 = require("../../services/searchPage/searchPage.service");
var SearchPage = /** @class */ (function () {
    function SearchPage(router, route, searchPageService) {
        this.router = router;
        this.route = route;
        this.searchPageService = searchPageService;
        this.users = [];
    }
    SearchPage.prototype.ngOnInit = function () {
        var _this = this;
        // In case of route params changes.
        this.route.params.subscribe(function (params) {
            _this.searchPageService.GetSearchResults(params["name"]).then(function (result) {
                if (result) {
                    _this.users = result;
                }
            });
        });
    };
    SearchPage = __decorate([
        core_1.Component({
            selector: 'searchPage',
            templateUrl: './searchPage.html',
            providers: [searchPage_service_1.SearchPageService]
        }),
        __metadata("design:paramtypes", [router_1.Router,
            router_1.ActivatedRoute,
            searchPage_service_1.SearchPageService])
    ], SearchPage);
    return SearchPage;
}());
exports.SearchPage = SearchPage;
//# sourceMappingURL=searchPage.component.js.map