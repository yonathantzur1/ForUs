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
var alert_service_1 = require("../../../services/alert/alert.service");
var global_service_1 = require("../../../services/global/global.service");
var userPrivacyWindow_service_1 = require("../../../services/userPage/userPrivacyWindow/userPrivacyWindow.service");
var UserPrivacyWindowComponent = /** @class */ (function () {
    function UserPrivacyWindowComponent(userPrivacyWindowService, alertService, globalService) {
        this.userPrivacyWindowService = userPrivacyWindowService;
        this.alertService = alertService;
        this.globalService = globalService;
        this.isLoading = false;
    }
    UserPrivacyWindowComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.isLoading = true;
        this.userPrivacyWindowService.GetUserPrivacyStatus().then(function (isUserPrivate) {
            _this.isLoading = false;
            if (isUserPrivate != null) {
                _this.isUserPrivate = isUserPrivate;
            }
            else {
                _this.alertService.Alert({
                    title: "שגיאה",
                    text: "אופס... שגיאה בטעינת סטטוס הפרטיות",
                    showCancelButton: false,
                    type: alert_service_1.ALERT_TYPE.DANGER
                });
                _this.CloseWindow();
            }
        });
    };
    UserPrivacyWindowComponent.prototype.CloseWindow = function () {
        this.globalService.setData("closeUserPrivacyWindow", true);
    };
    UserPrivacyWindowComponent.prototype.ChangePrivacyStatus = function () {
        var self = this;
        setTimeout(function () {
            self.isUserPrivate = !self.isUserPrivate;
        }, 0);
    };
    UserPrivacyWindowComponent.prototype.SavePrivacyStatus = function () {
        var _this = this;
        !this.isLoading &&
            this.userPrivacyWindowService.SetUserPrivacy(this.isUserPrivate).then(function (result) {
                if (result) {
                    _this.CloseWindow();
                }
                else {
                    _this.alertService.Alert({
                        title: "שגיאה",
                        text: "אופס... שגיאה בשמירת סטטוס הפרטיות",
                        showCancelButton: false,
                        type: alert_service_1.ALERT_TYPE.DANGER
                    });
                }
            });
    };
    UserPrivacyWindowComponent.prototype.KeyPress = function (event) {
        // In case of pressing escape.
        if (event.code == "Escape") {
            this.CloseWindow();
        }
    };
    __decorate([
        core_1.HostListener('document:keyup', ['$event']),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", void 0)
    ], UserPrivacyWindowComponent.prototype, "KeyPress", null);
    UserPrivacyWindowComponent = __decorate([
        core_1.Component({
            selector: 'userPrivacyWindow',
            templateUrl: './userPrivacyWindow.html',
            providers: [userPrivacyWindow_service_1.UserPrivacyWindowService]
        }),
        __metadata("design:paramtypes", [userPrivacyWindow_service_1.UserPrivacyWindowService,
            alert_service_1.AlertService,
            global_service_1.GlobalService])
    ], UserPrivacyWindowComponent);
    return UserPrivacyWindowComponent;
}());
exports.UserPrivacyWindowComponent = UserPrivacyWindowComponent;
//# sourceMappingURL=userPrivacyWindow.component.js.map