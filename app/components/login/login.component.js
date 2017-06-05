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
var core_1 = require("@angular/core");
var router_1 = require("@angular/router");
var login_service_1 = require("../../services/login/login.service");
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
        this.firstName = "";
        this.lastName = "";
        this.email = "";
        this.password = "";
    }
    return NewUser;
}());
exports.NewUser = NewUser;
var forgotBtnTextObj = { searchText: "חיפוש", resetPassText: "אפס סיסמא" };
var ForgotUser = (function () {
    function ForgotUser() {
        this.email = "";
        this.code = "";
        this.newPassword = "";
        this.showResetCodeField = false;
        this.hasResetCode = false;
        this.forgotBtnText = forgotBtnTextObj.searchText;
    }
    return ForgotUser;
}());
exports.ForgotUser = ForgotUser;
var LoginComponent = (function () {
    function LoginComponent(router, loginService) {
        this.router = router;
        this.loginService = loginService;
        this.user = new User();
        this.newUser = new NewUser();
        this.forgotUser = new ForgotUser();
        this.isLoading = false;
    }
    // Running on the array of validation functions and make sure all valid.
    // Getting validation array and object to valid.
    LoginComponent.prototype.Validation = function (funcArray, obj) {
        var isValid = true;
        var checkedFieldsIds = [];
        // Running on all login validation functions.
        for (var i = 0; i < funcArray.length; i++) {
            // In case the field was not invalid before.
            if (!IsInArray(checkedFieldsIds, funcArray[i].fieldId)) {
                // In case the field is not valid.
                if (!funcArray[i].isFieldValid(obj)) {
                    // In case the field is the first invalid field.
                    if (isValid) {
                        $("#" + funcArray[i].inputId).focus();
                    }
                    isValid = false;
                    // Push the field id to the array,
                    // so in the next validation of this field it will not be checked.
                    checkedFieldsIds.push(funcArray[i].fieldId);
                    // Show the microtext of the field. 
                    $("#" + funcArray[i].fieldId).html(funcArray[i].errMsg);
                }
                else {
                    // Clear the microtext of the field.
                    $("#" + funcArray[i].fieldId).html("");
                }
            }
        }
        checkedFieldsIds = [];
        return isValid;
    };
    // Login user and redirect him to main page.
    LoginComponent.prototype.Login = function () {
        var _this = this;
        // In case the login fields are valid.
        if (this.Validation(loginValidationFuncs, this.user)) {
            this.isLoading = true;
            this.loginService.Login(this.user).then(function (result) {
                _this.isLoading = false;
                // In case of server error.
                if (result == null) {
                    $("#server-error").snackbar("show");
                }
                else if (result == false) {
                    $("#login-failed").snackbar("show");
                }
                else {
                    _this.router.navigateByUrl('');
                }
            });
        }
    };
    // Regiter the new user to the DB.
    LoginComponent.prototype.Register = function () {
        var _this = this;
        // In case the register modal fields are valid.
        if (this.Validation(registerValidationFuncs, this.newUser)) {
            this.isLoading = true;
            this.loginService.Register(this.newUser).then(function (result) {
                _this.isLoading = false;
                // In case of server error.
                if (result == null) {
                    $("#server-error").snackbar("show");
                }
                else if (result == false) {
                    // Show microtext of the email field. 
                    $("#register-email-micro").html("אימייל זה כבר נמצא בשימוש");
                }
                else {
                    $("#register-modal").modal('hide');
                    _this.router.navigateByUrl('');
                }
            });
        }
    };
    // Send mail with reset code to the user.
    LoginComponent.prototype.ResetPassword = function () {
        var _this = this;
        // In case the forgot modal fields are valid.
        if (this.Validation(forgotValidationFuncs, this.forgotUser)) {
            this.isLoading = true;
            // In case the user is in the first stage of reset password.
            if (this.forgotUser.showResetCodeField == false) {
                this.loginService.Forgot(this.forgotUser.email).then(function (result) {
                    _this.isLoading = false;
                    // In case of server error.
                    if (result == null) {
                        $("#server-error").snackbar("show");
                    }
                    else if (result == false) {
                        // Show microtext of the email field. 
                        $("#forgot-email-micro").html("אימייל זה לא קיים במערכת");
                    }
                    else {
                        _this.forgotUser.showResetCodeField = true;
                        _this.forgotUser.forgotBtnText = forgotBtnTextObj.resetPassText;
                        $("#reset-password-alert").snackbar("show");
                    }
                });
            }
            else {
                this.loginService.ResetPassword(this.forgotUser).then(function (result) {
                    _this.isLoading = false;
                    // In case of server error.
                    if (result == null) {
                        $("#server-error").snackbar("show");
                    }
                    else if (result == false || result.emailNotFound) {
                        $("#forgot-email-micro").html("אימייל זה לא קיים במערכת");
                    }
                    else if (result.codeNotFound) {
                        $("#forgot-code-micro").html("הקוד שהוזן לא נמצא");
                    }
                    else if (result.maxTry || result.codeIsUsed) {
                        $("#forgot-code-micro").html("קוד זה נעול");
                    }
                    else if (result.codeIsExpired) {
                        $("#forgot-code-micro").html("פג תוקפו של הקוד שהוזן");
                    }
                    else if (result.codeNotValid) {
                        $("#forgot-code-micro").html("הקוד שהוזן שגוי");
                    }
                    else {
                        $("#forgot-modal").modal('hide');
                        swal('איפוס סיסמא', 'הסיסמא הוחלפה בהצלחה!', 'success');
                    }
                });
            }
        }
    };
    LoginComponent.prototype.hasResetCode = function () {
        this.forgotUser.hasResetCode = true;
        this.forgotUser.showResetCodeField = true;
        this.forgotUser.forgotBtnText = forgotBtnTextObj.resetPassText;
        $(".microtext").html("");
    };
    // Open modal and clear all.
    LoginComponent.prototype.OpenModal = function () {
        this.user = new User();
        this.newUser = new NewUser();
        this.forgotUser = new ForgotUser();
        $(".microtext").html("");
    };
    // Key up in login.
    LoginComponent.prototype.LoginKeyUp = function (event) {
        // In case the key is enter.
        if (event.keyCode == 13) {
            $(".user-input").blur();
            this.Login();
        }
    };
    // Key up in register modal.
    LoginComponent.prototype.RegisterKeyUp = function (event) {
        // In case the key is enter.
        if (event.keyCode == 13) {
            $(".user-input").blur();
            this.Register();
        }
    };
    // Key up in forgot modal.
    LoginComponent.prototype.ForgotKeyUp = function (event) {
        // In case the key is enter.
        if (event.keyCode == 13) {
            $(".user-input").blur();
            this.ResetPassword();
        }
    };
    // Hide microtext in a specific field.
    LoginComponent.prototype.HideMicrotext = function (fieldId) {
        $("#" + fieldId).html("");
    };
    return LoginComponent;
}());
LoginComponent = __decorate([
    core_1.Component({
        selector: 'login',
        templateUrl: './login.html',
        providers: [login_service_1.LoginService]
    }),
    __metadata("design:paramtypes", [router_1.Router, login_service_1.LoginService])
], LoginComponent);
exports.LoginComponent = LoginComponent;
//***Help vars and functions***//
// Login validation functions array.
var loginValidationFuncs = [
    {
        isFieldValid: function (user) {
            return (user.email ? true : false);
        },
        errMsg: "יש להזין כתובת אימייל",
        fieldId: "login-email-micro",
        inputId: "login-email"
    },
    {
        isFieldValid: function (user) {
            var emailPattern = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;
            return (emailPattern.test(user.email));
        },
        errMsg: "כתובת אימייל לא תקינה",
        fieldId: "login-email-micro",
        inputId: "login-email"
    },
    {
        isFieldValid: function (user) {
            return (user.password ? true : false);
        },
        errMsg: "יש להזין סיסמא",
        fieldId: "login-password-micro",
        inputId: "login-password"
    }
];
// Register validation functions array.
var registerValidationFuncs = [
    {
        isFieldValid: function (newUser) {
            return (newUser.firstName ? true : false);
        },
        errMsg: "יש להזין שם פרטי",
        fieldId: "register-firstName-micro",
        inputId: "register-firstName"
    },
    {
        isFieldValid: function (newUser) {
            var namePattern = /^[א-ת']{2,}([ ]+[א-ת']{2,})*([-]+[א-ת']{2,})*$/i;
            return (namePattern.test(newUser.firstName));
        },
        errMsg: "יש להזין שם תקין בעברית",
        fieldId: "register-firstName-micro",
        inputId: "register-firstName"
    },
    {
        isFieldValid: function (newUser) {
            return (newUser.lastName ? true : false);
        },
        errMsg: "יש להזין שם משפחה",
        fieldId: "register-lastName-micro",
        inputId: "register-lastName"
    },
    {
        isFieldValid: function (newUser) {
            var namePattern = /^[א-ת']{2,}([ ]+[א-ת']{2,})*([-]+[א-ת']{2,})*$/i;
            return (namePattern.test(newUser.lastName));
        },
        errMsg: "יש להזין שם תקין בעברית",
        fieldId: "register-lastName-micro",
        inputId: "register-lastName"
    },
    {
        isFieldValid: function (newUser) {
            return (newUser.email ? true : false);
        },
        errMsg: "יש להזין כתובת אימייל",
        fieldId: "register-email-micro",
        inputId: "register-email"
    },
    {
        isFieldValid: function (newUser) {
            var emailPattern = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;
            return (emailPattern.test(newUser.email));
        },
        errMsg: "כתובת אימייל לא תקינה",
        fieldId: "register-email-micro",
        inputId: "register-email"
    },
    {
        isFieldValid: function (newUser) {
            return (newUser.password ? true : false);
        },
        errMsg: "יש להזין סיסמא",
        fieldId: "register-password-micro",
        inputId: "register-password"
    }
];
var forgotValidationFuncs = [
    {
        isFieldValid: function (forgotUser) {
            return (forgotUser.email ? true : false);
        },
        errMsg: "יש להזין כתובת אימייל",
        fieldId: "forgot-email-micro",
        inputId: "forgot-email"
    },
    {
        isFieldValid: function (forgotUser) {
            var emailPattern = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;
            return (emailPattern.test(forgotUser.email));
        },
        errMsg: "כתובת אימייל לא תקינה",
        fieldId: "forgot-email-micro",
        inputId: "forgot-email"
    },
    {
        isFieldValid: function (forgotUser) {
            // In case the code field is shown.
            if (forgotUser.showResetCodeField || forgotUser.hasResetCode) {
                return (forgotUser.code ? true : false);
            }
            else {
                return true;
            }
        },
        errMsg: "יש להזין קוד אימות",
        fieldId: "forgot-code-micro",
        inputId: "forgot-code"
    },
    {
        isFieldValid: function (forgotUser) {
            // In case the code field is shown.
            if (forgotUser.showResetCodeField || forgotUser.hasResetCode) {
                return (forgotUser.newPassword ? true : false);
            }
            else {
                return true;
            }
        },
        errMsg: "יש להזין סיסמא חדשה",
        fieldId: "forgot-newPassword-micro",
        inputId: "forgot-newPassword"
    }
];
// Check if object is in array.
function IsInArray(array, value) {
    // Running on all the array.
    for (var i = 0; i < array.length; i++) {
        // In case the value is in the array.
        if (array[i] === value) {
            return true;
        }
    }
    return false;
}
//# sourceMappingURL=login.component.js.map