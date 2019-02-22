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
var userPasswordWindow_service_1 = require("../../../services/userPage/userPasswordWindow/userPasswordWindow.service");
var alert_service_1 = require("../../../services/alert/alert.service");
var global_service_1 = require("../../../services/global/global.service");
var event_service_1 = require("../../../services/event/event.service");
var microtext_service_1 = require("../../../services/microtext/microtext.service");
var enums_1 = require("../../../enums/enums");
var Password = /** @class */ (function () {
    function Password() {
        this.oldPassword = "";
        this.newPassword = "";
    }
    return Password;
}());
exports.Password = Password;
var UserPasswordWindowComponent = /** @class */ (function () {
    function UserPasswordWindowComponent(globalService, eventService, alertService, microtextService, userPasswordWindowService) {
        this.globalService = globalService;
        this.eventService = eventService;
        this.alertService = alertService;
        this.microtextService = microtextService;
        this.userPasswordWindowService = userPasswordWindowService;
        this.password = new Password();
        // Validation functions array.
        this.validationFuncs = [
            {
                isFieldValid: function (password) {
                    return password.oldPassword ? true : false;
                },
                errMsg: "יש להזין סיסמא נוכחית",
                fieldId: "old-password-micro",
                inputId: "oldPassword"
            },
            {
                isFieldValid: function (password) {
                    return password.newPassword ? true : false;
                },
                errMsg: "יש להזין סיסמא חדשה",
                fieldId: "new-password-micro",
                inputId: "newPassword"
            }
        ];
    }
    UserPasswordWindowComponent.prototype.CloseWindow = function () {
        this.eventService.Emit("closeUserPasswordWindow");
    };
    // Hide microtext in a specific field.
    UserPasswordWindowComponent.prototype.HideMicrotext = function (microtextId) {
        this.microtextService.HideMicrotext(microtextId);
    };
    UserPasswordWindowComponent.prototype.KeyPress = function (event) {
        // In case of pressing escape.
        if (event.code == "Escape") {
            this.CloseWindow();
        }
        else if (event.code == "Enter" || event.code == "NumpadEnter") {
            this.ChangePassword();
        }
    };
    UserPasswordWindowComponent.prototype.ChangePassword = function () {
        var _this = this;
        if (this.microtextService.Validation(this.validationFuncs, this.password)) {
            this.userPasswordWindowService.UpdateUserPassword(this.password).then(function (data) {
                if (data) {
                    var result = data.result;
                    if (result.lock) {
                        _this.microtextService.ShowMicrotext("old-password-micro", "העדכון ננעל למשך " + result.lock + " דקות");
                    }
                    else if (result == enums_1.USER_UPDATE_INFO_ERROR.WRONG_PASSWORD) {
                        _this.microtextService.ShowMicrotext("old-password-micro", "הסיסמא שהוזנה שגוייה");
                    }
                    else {
                        _this.CloseWindow();
                        _this.globalService.socket.emit("LogoutUserSessionServer", _this.userId, "הסיסמא התעדכנה בהצלחה!\nיש להיכנס מחדש.");
                    }
                }
                else {
                    _this.ChangePasswordErrorAlert();
                }
            });
        }
    };
    UserPasswordWindowComponent.prototype.ChangePasswordByMail = function () {
        var _this = this;
        this.userPasswordWindowService.ChangePasswordByMail().then(function (result) {
            _this.CloseWindow();
            if (result) {
                _this.alertService.Alert({
                    title: "שינוי סיסמא",
                    text: "יש להיכנס לקישור שנשלח לכתובת האימייל שלך.",
                    type: alert_service_1.ALERT_TYPE.SUCCESS,
                    showCancelButton: false
                });
            }
            else {
                _this.ChangePasswordErrorAlert();
            }
        });
    };
    UserPasswordWindowComponent.prototype.ChangePasswordErrorAlert = function () {
        this.alertService.Alert({
            title: "שינוי סיסמא",
            text: "אופס... אירעה שגיאה בשינוי הסיסמא",
            type: alert_service_1.ALERT_TYPE.DANGER,
            showCancelButton: false
        });
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], UserPasswordWindowComponent.prototype, "userId", void 0);
    __decorate([
        core_1.HostListener('document:keyup', ['$event']),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", void 0)
    ], UserPasswordWindowComponent.prototype, "KeyPress", null);
    UserPasswordWindowComponent = __decorate([
        core_1.Component({
            selector: 'userPasswordWindow',
            templateUrl: './userPasswordWindow.html',
            providers: [userPasswordWindow_service_1.UserPasswordWindowService],
            styleUrls: ['./userPasswordWindow.css', '../../userWindow.css']
        }),
        __metadata("design:paramtypes", [global_service_1.GlobalService,
            event_service_1.EventService,
            alert_service_1.AlertService,
            microtext_service_1.MicrotextService,
            userPasswordWindow_service_1.UserPasswordWindowService])
    ], UserPasswordWindowComponent);
    return UserPasswordWindowComponent;
}());
exports.UserPasswordWindowComponent = UserPasswordWindowComponent;
//# sourceMappingURL=userPasswordWindow.component.js.map