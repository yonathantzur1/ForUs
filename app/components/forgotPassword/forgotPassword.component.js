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
var router_1 = require("@angular/router");
var alert_service_1 = require("../../services/alert/alert.service");
var microtext_service_1 = require("../../services/microtext/microtext.service");
var global_service_1 = require("../../services/global/global.service");
var forgotPassword_service_1 = require("../../services/forgotPassword/forgotPassword.service");
var ForgotPasswordComponent = /** @class */ (function () {
    function ForgotPasswordComponent(router, route, alertService, microtextService, globalService, forgotPasswordService) {
        this.router = router;
        this.route = route;
        this.alertService = alertService;
        this.microtextService = microtextService;
        this.globalService = globalService;
        this.forgotPasswordService = forgotPasswordService;
        // Validation functions array.
        this.newPasswordValidations = [
            {
                isFieldValid: function (newPassword) {
                    return (newPassword ? true : false);
                },
                errMsg: "יש להזין סיסמא חדשה",
                fieldId: "new-password-micro",
                inputId: "new-password"
            }
        ];
    }
    ForgotPasswordComponent.prototype.ngOnInit = function () {
        var _this = this;
        // In case of route params changes.
        this.route.params.subscribe(function (params) {
            _this.resetPasswordToken = params["passToken"];
            _this.forgotPasswordService.ValidateResetPasswordToken(_this.resetPasswordToken)
                .then(function (result) {
                if (result) {
                    _this.isResetTokenValid = true;
                    _this.userName = result.name;
                }
                else {
                    _this.isResetTokenValid = false;
                }
            });
        });
    };
    ForgotPasswordComponent.prototype.CancelReset = function () {
        this.router.navigateByUrl('/login');
    };
    ForgotPasswordComponent.prototype.ResetPassword = function () {
        var _this = this;
        if (this.microtextService.Validation(this.newPasswordValidations, this.newPassword)) {
            this.forgotPasswordService.ResetPasswordByToken(this.resetPasswordToken, this.newPassword)
                .then(function (result) {
                var self = _this;
                if (result) {
                    self.globalService.CallSocketFunction('LogoutUserSessionServer', [null, "תוקף הסיסמא פג, יש להתחבר מחדש"]);
                    self.alertService.Alert({
                        title: "איפוס סיסמא",
                        text: "הסיסמא הוחלפה בהצלחה!",
                        showCancelButton: false,
                        type: alert_service_1.ALERT_TYPE.SUCCESS,
                        confirmFunc: function () {
                            self.router.navigateByUrl('/login');
                        }
                    });
                }
                else {
                    self.alertService.Alert({
                        title: "איפוס סיסמא",
                        text: "אופס... שגיאה באיפוס הסיסמא",
                        showCancelButton: false,
                        type: alert_service_1.ALERT_TYPE.DANGER
                    });
                }
            });
        }
    };
    ForgotPasswordComponent.prototype.CheckForEnter = function (event) {
        // In case the key is enter.
        if (event.key == "Enter" || event.key == "NumpadEnter") {
            this.ResetPassword();
        }
    };
    ForgotPasswordComponent.prototype.BackToLogin = function () {
        this.router.navigateByUrl('/login');
    };
    // Hide microtext in a specific field.
    ForgotPasswordComponent.prototype.HideMicrotext = function (microtextId) {
        this.microtextService.HideMicrotext(microtextId);
    };
    ForgotPasswordComponent = __decorate([
        core_1.Component({
            selector: 'forgotPassword',
            templateUrl: './forgotPassword.html',
            providers: [forgotPassword_service_1.ForgotPasswordService]
        }),
        __metadata("design:paramtypes", [router_1.Router,
            router_1.ActivatedRoute,
            alert_service_1.AlertService,
            microtext_service_1.MicrotextService,
            global_service_1.GlobalService,
            forgotPassword_service_1.ForgotPasswordService])
    ], ForgotPasswordComponent);
    return ForgotPasswordComponent;
}());
exports.ForgotPasswordComponent = ForgotPasswordComponent;
//# sourceMappingURL=forgotPassword.component.js.map