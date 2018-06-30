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
var microtext_service_1 = require("../../../services/microtext/microtext.service");
var EditUser = /** @class */ (function () {
    function EditUser() {
    }
    return EditUser;
}());
var UserEditWindowComponent = /** @class */ (function () {
    function UserEditWindowComponent(userEditWindowService, alertService, microtextService) {
        this.userEditWindowService = userEditWindowService;
        this.alertService = alertService;
        this.microtextService = microtextService;
        this.editUser = {};
        // Login validation functions array.
        this.editValidationFuncs = [
            {
                isFieldValid: function (editUser) {
                    var namePattern = /^[א-ת]{2,}([ ]+[א-ת]{2,})*([-]+[א-ת]{2,})*$/i;
                    return (namePattern.test(editUser.firstName));
                },
                errMsg: "יש להזין שם תקין בעברית",
                fieldId: "edit-user-first-name-micro",
                inputId: "edit-first-name"
            },
            {
                isFieldValid: function (editUser) {
                    var namePattern = /^[א-ת]{2,}([ ]+[א-ת]{2,})*([-]+[א-ת]{2,})*$/i;
                    return (namePattern.test(editUser.lastName));
                },
                errMsg: "יש להזין שם תקין בעברית",
                fieldId: "edit-user-last-name-micro",
                inputId: "edit-last-name"
            },
            {
                isFieldValid: function (editUser) {
                    var emailPattern = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;
                    return (emailPattern.test(editUser.email));
                },
                errMsg: "כתובת אימייל לא תקינה",
                fieldId: "edit-user-email-micro",
                inputId: "edit-email"
            }
        ];
    }
    UserEditWindowComponent.prototype.ngOnInit = function () {
        this.editUser.firstName = this.user.firstName;
        this.editUser.lastName = this.user.lastName;
        this.editUser.email = this.user.email;
    };
    UserEditWindowComponent.prototype.IsDisableSaveEdit = function () {
        if (!this.editUser.firstName || !this.editUser.lastName || !this.editUser.email) {
            return true;
        }
        else {
            return (this.editUser.firstName.trim() == this.user.firstName &&
                this.editUser.lastName.trim() == this.user.lastName &&
                this.editUser.email.trim() == this.user.email);
        }
    };
    UserEditWindowComponent.prototype.SaveChanges = function () {
        var _this = this;
        if (!this.IsDisableSaveEdit() &&
            this.microtextService.Validation(this.editValidationFuncs, this.editUser)) {
            var updatedFields = {};
            if (this.editUser.firstName.trim() != this.user.firstName) {
                updatedFields["firstName"] = this.editUser.firstName;
            }
            if (this.editUser.lastName.trim() != this.user.lastName) {
                updatedFields["lastName"] = this.editUser.lastName;
            }
            if (this.editUser.email.trim() != this.user.email) {
                updatedFields["email"] = this.editUser.email;
            }
            this.userEditWindowService.UpdateUserInfo(updatedFields).then(function (result) {
                if (result) {
                    if (result == -1) {
                        //this.editUser.emailMicrotext = "כתובת אימייל זו כבר נמצאת בשימוש";
                    }
                    else {
                        _this.alertService.Alert({
                            title: "עדכון מידע",
                            text: "העדכון בוצע בהצלחה",
                            type: alert_service_1.AlertType.SUCCESS,
                            showCancelButton: false
                        });
                    }
                }
                else {
                    _this.alertService.Alert({
                        title: "עדכון מידע",
                        text: "אופס...אירעה שגיאה בעדכון הפרטים",
                        type: alert_service_1.AlertType.DANGER,
                        showCancelButton: false
                    });
                }
            });
        }
    };
    UserEditWindowComponent.prototype.CloseWindow = function () {
    };
    // Hide microtext in a specific field.
    UserEditWindowComponent.prototype.HideMicrotext = function (microtextId) {
        this.microtextService.HideMicrotext(microtextId);
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", Object)
    ], UserEditWindowComponent.prototype, "user", void 0);
    UserEditWindowComponent = __decorate([
        core_1.Component({
            selector: 'userEditWindow',
            templateUrl: './userEditWindow.html',
            providers: [userEditWindow_service_1.UserEditWindowService]
        }),
        __metadata("design:paramtypes", [userEditWindow_service_1.UserEditWindowService,
            alert_service_1.AlertService,
            microtext_service_1.MicrotextService])
    ], UserEditWindowComponent);
    return UserEditWindowComponent;
}());
exports.UserEditWindowComponent = UserEditWindowComponent;
//# sourceMappingURL=userEditWindow.component.js.map