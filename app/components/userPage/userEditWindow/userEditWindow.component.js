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
var userEditWindow_service_1 = require("../../../services/userPage/userEditWindow/userEditWindow.service");
var alert_service_1 = require("../../../services/alert/alert.service");
var global_service_1 = require("../../../services/global/global.service");
var event_service_1 = require("../../../services/event/event.service");
var microtext_service_1 = require("../../../services/microtext/microtext.service");
var enums_1 = require("../../../enums/enums");
var regexpEnums_1 = require("../../../regex/regexpEnums");
var EditUser = /** @class */ (function () {
    function EditUser() {
    }
    return EditUser;
}());
var UserEditWindowComponent = /** @class */ (function () {
    function UserEditWindowComponent(userEditWindowService, alertService, globalService, eventService, microtextService) {
        this.userEditWindowService = userEditWindowService;
        this.alertService = alertService;
        this.globalService = globalService;
        this.eventService = eventService;
        this.microtextService = microtextService;
        this.editUser = {};
        this.isShowPasswordValidationWindow = false;
        // Validation functions array.
        this.editValidationFuncs = [
            {
                isFieldValid: function (editUser, userRegexp) {
                    var namePattern = userRegexp.name;
                    return (namePattern.test(editUser.firstName));
                },
                errMsg: "יש להזין שם תקין בעברית",
                fieldId: "edit-user-first-name-micro",
                inputId: "edit-first-name"
            },
            {
                isFieldValid: function (editUser, userRegexp) {
                    var namePattern = userRegexp.name;
                    return (namePattern.test(editUser.lastName));
                },
                errMsg: "יש להזין שם תקין בעברית",
                fieldId: "edit-user-last-name-micro",
                inputId: "edit-last-name"
            },
            {
                isFieldValid: function (editUser, userRegexp) {
                    var emailPattern = userRegexp.email;
                    return (emailPattern.test(editUser.email));
                },
                errMsg: "כתובת אימייל לא תקינה",
                fieldId: "edit-user-email-micro",
                inputId: "edit-email"
            }
        ];
        this.passwordValidationFuncs = [
            {
                isFieldValid: function (editUser) {
                    return (editUser.password ? true : false);
                },
                errMsg: "יש להזין את סיסמת החשבון",
                fieldId: "edit-user-password-micro",
                inputId: "edit-password"
            },
        ];
    }
    UserEditWindowComponent.prototype.ngOnInit = function () {
        this.editUser.firstName = this.user.firstName;
        this.editUser.lastName = this.user.lastName;
        this.editUser.email = this.user.email;
    };
    UserEditWindowComponent.prototype.IsDisableSaveEdit = function () {
        if (!this.editUser.firstName.trim() ||
            !this.editUser.lastName.trim() ||
            !this.editUser.email.trim()) {
            return true;
        }
        else {
            return (this.editUser.firstName.trim() == this.user.firstName &&
                this.editUser.lastName.trim() == this.user.lastName &&
                this.editUser.email.trim().toLowerCase() == this.user.email.toLowerCase());
        }
    };
    UserEditWindowComponent.prototype.ShowValidatePasswordWindow = function () {
        if (!this.IsDisableSaveEdit() &&
            this.microtextService.Validation(this.editValidationFuncs, this.editUser, regexpEnums_1.UserRegexp)) {
            this.isShowPasswordValidationWindow = true;
        }
    };
    UserEditWindowComponent.prototype.BackToDetailsWindow = function () {
        this.isShowPasswordValidationWindow = false;
        this.editUser.password = "";
    };
    UserEditWindowComponent.prototype.CloseWindow = function () {
        this.eventService.Emit("closeUserEditWindow", true);
    };
    // Hide microtext in a specific field.
    UserEditWindowComponent.prototype.HideMicrotext = function (microtextId) {
        this.microtextService.HideMicrotext(microtextId);
    };
    UserEditWindowComponent.prototype.KeyPress = function (event) {
        // In case of pressing escape.
        if (event.code == "Escape") {
            this.CloseWindow();
        }
        else if (event.code == "Enter" || event.code == "NumpadEnter") {
            if (!this.isShowPasswordValidationWindow) {
                this.ShowValidatePasswordWindow();
            }
            else {
                this.SaveChanges();
            }
        }
    };
    UserEditWindowComponent.prototype.SaveChanges = function () {
        var _this = this;
        if (this.microtextService.Validation(this.passwordValidationFuncs, this.editUser)) {
            var updatedFields = {};
            updatedFields["password"] = this.editUser.password;
            delete this.editUser.password;
            // Trim all editUser properties.
            Object.keys(this.editUser).forEach(function (key) {
                // Trim the field in case it is string.
                if (typeof _this.editUser[key] == "string") {
                    _this.editUser[key] = _this.editUser[key].trim();
                }
                // In case the new field is not equal to the old one.
                if (_this.editUser[key] != _this.user[key]) {
                    // Put the field on update object to send the server.
                    updatedFields[key] = _this.editUser[key];
                }
            });
            this.userEditWindowService.UpdateUserInfo(updatedFields).then(function (data) {
                if (data) {
                    var result = data.result;
                    if (result.lock) {
                        _this.microtextService.ShowMicrotext("edit-user-password-micro", "העדכון ננעל למשך " + result.lock + " דקות");
                    }
                    else if (result == enums_1.USER_UPDATE_INFO_ERROR.EMAIL_EXISTS) {
                        _this.BackToDetailsWindow();
                        _this.microtextService.ShowMicrotext("edit-user-email-micro", "כתובת אימייל זו כבר נמצאת בשימוש");
                    }
                    else if (result == enums_1.USER_UPDATE_INFO_ERROR.WRONG_PASSWORD) {
                        _this.microtextService.ShowMicrotext("edit-user-password-micro", "הסיסמא שהוזנה שגוייה");
                    }
                    else {
                        _this.CloseWindow();
                        _this.globalService.socket.emit("LogoutUserSessionServer", _this.user._id, "הפרטים התעדכנו בהצלחה!\nיש להיכנס מחדש.");
                    }
                }
                else {
                    _this.alertService.Alert({
                        title: "עדכון מידע",
                        text: "אופס... אירעה שגיאה בעדכון הפרטים",
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
    ], UserEditWindowComponent.prototype, "user", void 0);
    __decorate([
        core_1.HostListener('document:keyup', ['$event']),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", void 0)
    ], UserEditWindowComponent.prototype, "KeyPress", null);
    UserEditWindowComponent = __decorate([
        core_1.Component({
            selector: 'userEditWindow',
            templateUrl: './userEditWindow.html',
            providers: [userEditWindow_service_1.UserEditWindowService],
            styleUrls: ['./userEditWindow.css']
        }),
        __metadata("design:paramtypes", [userEditWindow_service_1.UserEditWindowService,
            alert_service_1.AlertService,
            global_service_1.GlobalService,
            event_service_1.EventService,
            microtext_service_1.MicrotextService])
    ], UserEditWindowComponent);
    return UserEditWindowComponent;
}());
exports.UserEditWindowComponent = UserEditWindowComponent;
//# sourceMappingURL=userEditWindow.component.js.map