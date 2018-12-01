"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var basic_service_1 = require("../basic/basic.service");
var SearchPageService = /** @class */ (function (_super) {
    __extends(SearchPageService, _super);
    function SearchPageService() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.prefix = "/api/searchPage";
        return _this;
    }
    SearchPageService.prototype.GetSearchResults = function (input) {
        return _super.prototype.get.call(this, this.prefix + '/getSearchResults?input=' + input)
            .toPromise()
            .then(function (result) {
            return result;
        })
            .catch(function (e) {
            return null;
        });
    };
    SearchPageService.prototype.GetUserFriendsStatus = function () {
        return _super.prototype.get.call(this, this.prefix + '/getUserFriendsStatus')
            .toPromise()
            .then(function (result) {
            return result;
        })
            .catch(function (e) {
            return null;
        });
    };
    return SearchPageService;
}(basic_service_1.BasicService));
exports.SearchPageService = SearchPageService;
//# sourceMappingURL=searchPage.service.js.map