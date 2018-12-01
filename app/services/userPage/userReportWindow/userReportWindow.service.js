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
var basic_service_1 = require("../../basic/basic.service");
var UserReportWindowService = /** @class */ (function (_super) {
    __extends(UserReportWindowService, _super);
    function UserReportWindowService() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.prefix = "/api/userReportWindow";
        return _this;
    }
    UserReportWindowService.prototype.GetAllReportReasons = function () {
        return _super.prototype.get.call(this, this.prefix + '/getAllReportReasons')
            .toPromise()
            .then(function (result) {
            return result;
        })
            .catch(function (e) {
            return null;
        });
    };
    UserReportWindowService.prototype.ReportUser = function (reportedUserId, reasonId, reasonDetails) {
        var data = { reportedUserId: reportedUserId, reasonId: reasonId, reasonDetails: reasonDetails };
        return _super.prototype.post.call(this, this.prefix + '/reportUser', data)
            .toPromise()
            .then(function (result) {
            return result;
        })
            .catch(function (e) {
            return null;
        });
    };
    return UserReportWindowService;
}(basic_service_1.BasicService));
exports.UserReportWindowService = UserReportWindowService;
//# sourceMappingURL=userReportWindow.service.js.map