"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var basic_service_1 = require("../../basic/basic.service");
var StatisticsService = /** @class */ (function (_super) {
    __extends(StatisticsService, _super);
    function StatisticsService() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.prefix = "/api/statistics";
        return _this;
    }
    StatisticsService.prototype.GetChartData = function (logType, range, datesRange, email) {
        var data = {
            logType: logType,
            range: range,
            datesRange: datesRange,
            email: email
        };
        return _super.prototype.post.call(this, this.prefix + '/getChartData', data)
            .toPromise()
            .then(function (result) {
            return result;
        })
            .catch(function (e) {
            return null;
        });
    };
    StatisticsService.prototype.GetUserByEmail = function (email) {
        return _super.prototype.get.call(this, this.prefix + '/getUserByEmail?email=' + email)
            .toPromise()
            .then(function (result) {
            return result;
        })
            .catch(function (e) {
            return null;
        });
    };
    return StatisticsService;
}(basic_service_1.BasicService));
exports.StatisticsService = StatisticsService;
//# sourceMappingURL=statistics.service.js.map