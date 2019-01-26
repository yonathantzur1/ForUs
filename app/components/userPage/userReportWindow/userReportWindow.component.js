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
var event_service_1 = require("../../../services/event/event.service");
var ReportReason = /** @class */ (function () {
    function ReportReason() {
    }
    return ReportReason;
}());
var UserReportWindowComponent = /** @class */ (function () {
    function UserReportWindowComponent(userReportWindowService, alertService, eventService) {
        this.userReportWindowService = userReportWindowService;
        this.alertService = alertService;
        this.eventService = eventService;
        this.reportText = "";
        this.maxReportTextLength = 600;
        this.isShowTextReasonWindow = false;
        this.isShowEmptyFieldAlert = false;
    }
    UserReportWindowComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.isLoading = true;
        this.userReportWindowService.GetAllReportReasons().then(function (result) {
            _this.isLoading = false;
            if (result) {
                _this.reportReasons = result;
                _this.InitializeReasonButtons();
            }
            else {
                _this.CloseWindow();
                _this.alertService.Alert({
                    title: "דיווח משתמש",
                    text: "אופס... אירעה שגיאה בפתיחת חלון הדיווח.",
                    type: alert_service_1.ALERT_TYPE.DANGER,
                    showCancelButton: false
                });
            }
        });
    };
    UserReportWindowComponent.prototype.CloseWindow = function () {
        this.eventService.Emit("closeUserReportWindow");
    };
    UserReportWindowComponent.prototype.InitializeReasonButtons = function () {
        this.reportReasons.forEach(function (reason) {
            reason.isClicked = false;
        });
    };
    UserReportWindowComponent.prototype.ClickReasonButton = function (btn) {
        // Disable selected btn in case it is already clicked.
        if (btn.isClicked) {
            btn.isClicked = false;
        }
        else {
            this.InitializeReasonButtons();
            btn.isClicked = true;
        }
    };
    UserReportWindowComponent.prototype.IsDisableReportBtn = function () {
        if (!this.reportReasons) {
            return true;
        }
        else {
            for (var i = 0; i < this.reportReasons.length; i++) {
                if (this.reportReasons[i].isClicked) {
                    return false;
                }
            }
            return true;
        }
    };
    UserReportWindowComponent.prototype.ShowTextReasonWindow = function () {
        if (!this.IsDisableReportBtn()) {
            this.isShowTextReasonWindow = true;
        }
    };
    UserReportWindowComponent.prototype.BackToReasonsWindow = function () {
        this.isShowTextReasonWindow = false;
    };
    UserReportWindowComponent.prototype.HideEmptyFieldAlert = function () {
        this.isShowEmptyFieldAlert = false;
    };
    UserReportWindowComponent.prototype.GetSelectedReasonId = function () {
        for (var i = 0; i < this.reportReasons.length; i++) {
            if (this.reportReasons[i].isClicked) {
                return this.reportReasons[i]._id;
            }
        }
        return null;
    };
    UserReportWindowComponent.prototype.KeyPress = function (event) {
        // In case of pressing escape.
        if (event.code == "Escape") {
            this.CloseWindow();
        }
        else if (event.code == "Enter" || event.code == "NumpadEnter") {
            if (!this.isShowTextReasonWindow) {
                this.ShowTextReasonWindow();
            }
        }
    };
    UserReportWindowComponent.prototype.ReportUser = function () {
        var _this = this;
        // In case the user did not fill the description text.
        if (this.reportText.trim().length == 0) {
            this.isShowEmptyFieldAlert = true;
        }
        else {
            var selectedReasonId = this.GetSelectedReasonId();
            this.userReportWindowService.ReportUser(this.user._id, selectedReasonId, this.reportText).then(function (result) {
                if (result) {
                    _this.CloseWindow();
                    var successMsg = "הדיווח שהזנת נשמר בהצלחה, ויבדק על ידי צוות האתר." + "\n" +
                        "תודה שעזרת לשמור על סביבה בטוחה יותר!";
                    _this.alertService.Alert({
                        title: "דיווח משתמש",
                        text: successMsg,
                        type: alert_service_1.ALERT_TYPE.SUCCESS,
                        showCancelButton: false
                    });
                }
                else {
                    _this.alertService.Alert({
                        title: "דיווח משתמש",
                        text: "אופס... אירעה שגיאה בשמירת הדיווח.",
                        type: alert_service_1.ALERT_TYPE.DANGER,
                        showCancelButton: false
                    });
                }
            });
        }
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", Object)
    ], UserReportWindowComponent.prototype, "user", void 0);
    __decorate([
        core_1.HostListener('document:keyup', ['$event']),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", void 0)
    ], UserReportWindowComponent.prototype, "KeyPress", null);
    UserReportWindowComponent = __decorate([
        core_1.Component({
            selector: 'userReportWindow',
            templateUrl: './userReportWindow.html',
            providers: [userReportWindow_service_1.UserReportWindowService],
            styleUrls: ['./userReportWindow.css']
        }),
        __metadata("design:paramtypes", [userReportWindow_service_1.UserReportWindowService,
            alert_service_1.AlertService,
            event_service_1.EventService])
    ], UserReportWindowComponent);
    return UserReportWindowComponent;
}());
exports.UserReportWindowComponent = UserReportWindowComponent;
//# sourceMappingURL=userReportWindow.component.js.map