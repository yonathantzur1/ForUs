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
var userReportWindow_service_1 = require("../../../services/userPage/userReportWindow/userReportWindow.service");
var alert_service_1 = require("../../../services/alert/alert.service");
var global_service_1 = require("../../../services/global/global.service");
var microtext_service_1 = require("../../../services/microtext/microtext.service");
var ReportReason = /** @class */ (function () {
    function ReportReason() {
    }
    return ReportReason;
}());
var UserReportWindow = /** @class */ (function () {
    function UserReportWindow(userReportWindowService, alertService, globalService, microtextService) {
        this.userReportWindowService = userReportWindowService;
        this.alertService = alertService;
        this.globalService = globalService;
        this.microtextService = microtextService;
        this.isShowTextReasonWindow = false;
    }
    UserReportWindow.prototype.ngOnInit = function () {
        var _this = this;
        this.userReportWindowService.GetAllReportReasons().then(function (result) {
            if (result) {
                _this.reportReasons = result;
                _this.InitializeReasonButtons();
            }
            else {
            }
        });
    };
    UserReportWindow.prototype.CloseWindow = function () {
        this.globalService.setData("closeUserReportWindow", true);
    };
    UserReportWindow.prototype.InitializeReasonButtons = function () {
        this.reportReasons.forEach(function (reason) {
            reason.isClicked = false;
        });
    };
    UserReportWindow.prototype.ClickReasonButton = function (btn) {
        // Disable selected btn in case it is already clicked.
        if (btn.isClicked) {
            btn.isClicked = false;
        }
        else {
            this.InitializeReasonButtons();
            btn.isClicked = true;
        }
    };
    UserReportWindow.prototype.IsDisableReportBtn = function () {
        for (var i = 0; i < this.reportReasons.length; i++) {
            if (this.reportReasons[i].isClicked) {
                return false;
            }
        }
        return true;
    };
    UserReportWindow.prototype.ShowTextReasonWindow = function () {
        if (!this.IsDisableReportBtn()) {
            this.isShowTextReasonWindow = true;
        }
    };
    UserReportWindow.prototype.BackToReasonsWindow = function () {
        this.isShowTextReasonWindow = false;
    };
    UserReportWindow.prototype.ReportUser = function () {
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", Object)
    ], UserReportWindow.prototype, "user", void 0);
    UserReportWindow = __decorate([
        core_1.Component({
            selector: 'userReportWindow',
            templateUrl: './userReportWindow.html',
            providers: [userReportWindow_service_1.UserReportWindowService]
        }),
        __metadata("design:paramtypes", [userReportWindow_service_1.UserReportWindowService,
            alert_service_1.AlertService,
            global_service_1.GlobalService,
            microtext_service_1.MicrotextService])
    ], UserReportWindow);
    return UserReportWindow;
}());
exports.UserReportWindow = UserReportWindow;
//# sourceMappingURL=userReportWindow.component.js.map