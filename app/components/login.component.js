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
var core_1 = require('@angular/core');
var login_service_1 = require('../services/login.service');
var User = (function () {
    function User() {
        this.email = "";
        this.password = "";
    }
    return User;
}());
exports.User = User;
var NewUser = (function () {
    function NewUser() {
        this.name = "";
        this.email = "";
        this.password = "";
    }
    return NewUser;
}());
exports.NewUser = NewUser;
var LoginComponent = (function () {
    function LoginComponent(loginService) {
        this.loginService = loginService;
        this.user = new User();
        this.newUser = new NewUser();
        this.isLoading = false;
    }
    // Running on the array of login validation functions and make sure all valid.
    LoginComponent.prototype.LoginValidation = function () {
        var isValid = true;
        // Running on all login validation functions.
        for (var i = 0; i < loginValidationFuncs.length; i++) {
            // In case the field is not valid.
            if (!loginValidationFuncs[i].isFieldValid(this.user)) {
                // In case the field is the first invalid field.
                if (isValid) {
                    $("#" + loginValidationFuncs[i].fieldId).focus();
                }
                CreatePopover(loginValidationFuncs[i].fieldId, loginValidationFuncs[i].errMsg);
                isValid = false;
            }
        }
        return isValid;
    };
    // Login user and redirect him to main page.
    LoginComponent.prototype.Login = function () {
        var _this = this;
        // Focus out login button.
        $("#login-btn").blur();
        // In case the login fields are valid.
        if (this.LoginValidation()) {
            this.isLoading = true;
            this.loginService.Login(this.user.email, this.user.password).then(function (result) {
                _this.isLoading = false;
                // In case of server error.
                if (result == null) {
                    $("#server-error").snackbar("show");
                }
                else if (result == false) {
                    swal('אופס...', 'כתובת האימייל או הסיסמא שגויים', 'error');
                }
                else {
                    swal("ברוך הבא!");
                }
            });
        }
    };
    // Running on the array of register validation functions and make sure all valid.
    LoginComponent.prototype.RegisterValidation = function () {
        var isValid = true;
        // Running on all register validation functions.
        for (var i = 0; i < registerValidationFuncs.length; i++) {
            // In case the field is not valid.
            if (!registerValidationFuncs[i].isFieldValid(this.newUser)) {
                isValid = false;
            }
        }
        return isValid;
    };
    // Regiter the new user to the DB.
    LoginComponent.prototype.Register = function () {
        var _this = this;
        // Focus out register button.
        $("#register-btn").blur();
        // In case the register modal fields are valid.
        if (this.RegisterValidation()) {
            this.isLoading = true;
            this.loginService.Register(this.newUser.name, this.newUser.email, this.newUser.password).then(function (result) {
                _this.isLoading = false;
                // In case of server error.
                if (result == null) {
                    $("#server-error").snackbar("show");
                }
                else if (result == false) {
                    swal('אופס...', 'כתובת האימייל כבר נמצאת בשימוש!', 'error');
                }
                else {
                    $("#register-modal").modal('hide');
                }
            });
        }
    };
    // Exit from register modal.
    LoginComponent.prototype.CancelRegister = function () {
        $("#register-modal").modal('hide');
    };
    LoginComponent.prototype.LoginKeyUp = function (event) {
        // In case the key is enter.
        if (event.keyCode == 13) {
            $(".user-input").blur();
            this.Login();
        }
    };
    LoginComponent.prototype.RegisterKeyUp = function (event) {
        // In case the key is enter.
        if (event.keyCode == 13) {
            $(".user-input").blur();
            this.Register();
        }
    };
    LoginComponent.prototype.ClearPopover = function (elementId) {
        $("#" + elementId).popover("destroy");
    };
    LoginComponent = __decorate([
        core_1.Component({
            selector: 'login',
            templateUrl: 'views/login.html',
            providers: [login_service_1.LoginService]
        }), 
        __metadata('design:paramtypes', [login_service_1.LoginService])
    ], LoginComponent);
    return LoginComponent;
}());
exports.LoginComponent = LoginComponent;
//***Help vars and functions***//
// Login validation functions array.
var loginValidationFuncs = [
    {
        isFieldValid: function (user) {
            return (user.email ? true : false);
        },
        errMsg: "נדרש",
        fieldId: "login-email"
    },
    {
        isFieldValid: function (user) {
            return (user.password ? true : false);
        },
        errMsg: "נדרש",
        fieldId: "login-password"
    }
];
// Register validation functions array.
var registerValidationFuncs = [
    {
        isFieldValid: function (newUser) {
            return (newUser.name ? true : false);
        },
        errMsg: "הכנס את שמך",
        fieldId: "register-name"
    },
    {
        isFieldValid: function (newUser) {
            return (newUser.email ? true : false);
        },
        errMsg: "הכנס אימייל",
        fieldId: "register-email"
    },
    {
        isFieldValid: function (newUser) {
            return (newUser.password ? true : false);
        },
        errMsg: "הכנס סיסמא",
        fieldId: "register-password"
    }
];
function CreatePopover(elementId, text) {
    $("#" + elementId).popover({
        placement: "left",
        toggle: "popover",
        content: text,
        animation: true
    });
    $("#" + elementId).popover("show");
}
//# sourceMappingURL=login.component.js.map