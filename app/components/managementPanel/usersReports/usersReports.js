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
var usersReports_service_1 = require("../../../services/managementPanel/usersReports/usersReports.service");
var snackbar_service_1 = require("../../../services/snackbar/snackbar.service");
var enums_1 = require("../../../enums/enums");
var Report = /** @class */ (function () {
    function Report() {
    }
    return Report;
}());
var UsersReportsComponent = /** @class */ (function () {
    function UsersReportsComponent(usersReportsService, snackbarService) {
        this.usersReportsService = usersReportsService;
        this.snackbarService = snackbarService;
        this.userReportStatus = enums_1.USER_REPORT_STATUS;
    }
    UsersReportsComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.usersReportsService.GetAllReports().then(function (reports) {
            if (!reports) {
                _this.snackbarService.Snackbar("שגיאה בטעינת דיווחי משתמשים");
            }
            else {
                reports.forEach(function (report) {
                    _this.CalculateReportStatus(report);
                });
                _this.reports = reports;
            }
        });
    };
    UsersReportsComponent.prototype.CalculateReportStatus = function (report) {
        // In case the report was closed.
        if (report.closeDate) {
            report.status = enums_1.USER_REPORT_STATUS.CLOSE;
        }
        // In case the report was taken by manager.
        else if (report.handledManagerId) {
            report.status = enums_1.USER_REPORT_STATUS.IS_PROCESS;
        }
        else {
            report.status = enums_1.USER_REPORT_STATUS.ACTIVE;
        }
    };
    UsersReportsComponent = __decorate([
        core_1.Component({
            selector: 'usersReports',
            templateUrl: './usersReports.html',
            providers: [usersReports_service_1.UsersReportsService]
        }),
        __metadata("design:paramtypes", [usersReports_service_1.UsersReportsService,
            snackbar_service_1.SnackbarService])
    ], UsersReportsComponent);
    return UsersReportsComponent;
}());
exports.UsersReportsComponent = UsersReportsComponent;
//# sourceMappingURL=usersReports.js.map