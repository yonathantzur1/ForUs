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
var HomeService = /** @class */ (function (_super) {
    __extends(HomeService, _super);
    function HomeService() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.prefix = "/api/home";
        return _this;
    }
    HomeService.prototype.SaveUserLocation = function (xCord, yCord) {
        var location = { xCord: xCord, yCord: yCord };
        return _super.prototype.put.call(this, this.prefix + '/saveUserLocation', location)
            .toPromise()
            .then(function (result) {
            return result;
        })
            .catch(function (e) {
            return null;
        });
    };
    HomeService.prototype.SaveUserLocationError = function (error) {
        var details = { error: error };
        return _super.prototype.put.call(this, this.prefix + '/saveUserLocationError', details)
            .toPromise()
            .then(function (result) {
            return result;
        })
            .catch(function (e) {
            return null;
        });
    };
    return HomeService;
}(basic_service_1.BasicService));
exports.HomeService = HomeService;
//# sourceMappingURL=home.service.js.map