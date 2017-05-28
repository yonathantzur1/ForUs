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
var core_1 = require("@angular/core");
var http_1 = require("@angular/http");
require("rxjs/add/operator/toPromise");
var NavbarService = (function () {
    function NavbarService(http) {
        this.http = http;
        this.headers = new http_1.Headers({ 'Content-Type': 'application/json' });
    }
    NavbarService.prototype.GetMainSearchResults = function (searchInput, searchLimit) {
        var details = { "searchInput": searchInput, "searchLimit": searchLimit };
        return this.http.post('/getMainSearchResults', JSON.stringify(details), { headers: this.headers })
            .toPromise()
            .then(function (result) {
            return result.json();
        })
            .catch(function (result) {
            return null;
        });
    };
    NavbarService.prototype.GetMainSearchResultsWithImages = function (results) {
        var details = { "results": results };
        return this.http.post('/getMainSearchResultsWithImages', JSON.stringify(details), { headers: this.headers })
            .toPromise()
            .then(function (result) {
            return result.json();
        })
            .catch(function (result) {
            return null;
        });
    };
    return NavbarService;
}());
NavbarService = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [http_1.Http])
], NavbarService);
exports.NavbarService = NavbarService;
//# sourceMappingURL=navbar.service.js.map