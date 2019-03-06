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
var alert_service_1 = require("../../../../services/alert/alert.service");
var microtext_service_1 = require("../../../../services/microtext/microtext.service");
var deleteUser_service_1 = require("../../services/deleteUser/deleteUser.service");
var DeleteUserComponent = /** @class */ (function () {
    function DeleteUserComponent(router, route, alertService, microtextService, deleteUserService) {
        this.router = router;
        this.route = route;
        this.alertService = alertService;
        this.microtextService = microtextService;
        this.deleteUserService = deleteUserService;
        // Validation functions array.
        this.passwordValidations = [
            {
                isFieldValid: function (password) {
                    return (password ? true : false);
                },
                errMsg: "יש להזין סיסמא",
                fieldId: "password-micro",
                inputId: "password"
            }
        ];
    }
    DeleteUserComponent.prototype.ngOnInit = function () {
        var _this = this;
        // In case of route params changes.
        this.route.params.subscribe(function (params) {
            _this.deleteUserToken = params["passToken"];
            _this.deleteUserService.ValidateDeleteUserToken(_this.deleteUserToken)
                .then(function (result) {
                if (result) {
                    _this.isDeleteTokenValid = true;
                    _this.userName = result.name;
                }
                else {
                    _this.isDeleteTokenValid = false;
                }
            });
        });
    };
    DeleteUserComponent.prototype.BackToLogin = function () {
        this.router.navigateByUrl('/login');
    };
    DeleteUserComponent.prototype.DeleteUser = function () {
        var _this = this;
        if (!this.microtextService.Validation(this.passwordValidations, this.password)) {
            return;
        }
        this.deleteUserService.DeleteAccount(this.deleteUserToken, this.password).then(function (result) {
            if (result) {
                _this.alertService.Alert({
                    title: "מחיקת משתמש",
                    text: "מחיקת המשתמש שלך בוצעה בהצלחה",
                    showCancelButton: false,
                    type: alert_service_1.ALERT_TYPE.INFO
                });
                _this.BackToLogin();
            }
            else if (result == false) {
                _this.microtextService.ShowMicrotext("password-micro", "סיסמא שגוייה");
            }
            else {
                _this.alertService.Alert({
                    title: "שגיאה",
                    text: "אופס... שגיאה בתהליך מחיקת המשתמש",
                    showCancelButton: false,
                    type: alert_service_1.ALERT_TYPE.DANGER
                });
            }
        });
    };
    DeleteUserComponent.prototype.CheckForEnter = function (event) {
        // In case the key is enter.
        if (event.key == "Enter" || event.key == "NumpadEnter") {
            this.DeleteUser();
        }
    };
    // Hide microtext in a specific field.
    DeleteUserComponent.prototype.HideMicrotext = function (microtextId) {
        this.microtextService.HideMicrotext(microtextId);
    };
    DeleteUserComponent = __decorate([
        core_1.Component({
            selector: 'deleteUser',
            templateUrl: './deleteUser.html',
            providers: [deleteUser_service_1.DeleteUserService],
            styleUrls: ['./deleteUser.css']
        }),
        __metadata("design:paramtypes", [router_1.Router,
            router_1.ActivatedRoute,
            alert_service_1.AlertService,
            microtext_service_1.MicrotextService,
            deleteUser_service_1.DeleteUserService])
    ], DeleteUserComponent);
    return DeleteUserComponent;
}());
exports.DeleteUserComponent = DeleteUserComponent;
//# sourceMappingURL=deleteUser.component.js.map