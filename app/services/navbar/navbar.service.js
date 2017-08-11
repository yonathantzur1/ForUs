"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var basic_service_1 = require("../basic/basic.service");
var NavbarService = (function (_super) {
    __extends(NavbarService, _super);
    function NavbarService() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.prefix = "/api/navbar";
        return _this;
    }
    NavbarService.prototype.GetMainSearchResults = function (searchInput, searchLimit) {
        var details = { "searchInput": searchInput, "searchLimit": searchLimit };
        return _super.prototype.post.call(this, this.prefix + '/getMainSearchResults', JSON.stringify(details))
            .toPromise()
            .then(function (result) {
            return result.json();
        })
            .catch(function (result) {
            return null;
        });
    };
    NavbarService.prototype.GetMainSearchResultsWithImages = function (ids) {
        var details = { "ids": ids };
        return _super.prototype.post.call(this, this.prefix + '/getMainSearchResultsWithImages', JSON.stringify(details))
            .toPromise()
            .then(function (result) {
            return result.json();
        })
            .catch(function (result) {
            return null;
        });
    };
    return NavbarService;
}(basic_service_1.BasicService));
exports.NavbarService = NavbarService;
//# sourceMappingURL=navbar.service.js.map