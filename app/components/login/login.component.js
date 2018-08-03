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
var global_service_1 = require("../../services/global/global.service");
var alert_service_1 = require("../../services/alert/alert.service");
var snackbar_service_1 = require("../../services/snackbar/snackbar.service");
var microtext_service_1 = require("../../services/microtext/microtext.service");
var login_service_1 = require("../../services/login/login.service");
var forgotPassword_service_1 = require("../../services/login/forgotPassword/forgotPassword.service");
var regexpEnums_1 = require("../../regex/regexpEnums");
var User = /** @class */ (function () {
    function User() {
        this.email = "";
        this.password = "";
    }
    return User;
}());
exports.User = User;
var NewUser = /** @class */ (function () {
    function NewUser() {
        this.firstName = "";
        this.lastName = "";
        this.email = "";
        this.password = "";
    }
    return NewUser;
}());
exports.NewUser = NewUser;
var FORGOT_BTN_TEXT;
(function (FORGOT_BTN_TEXT) {
    FORGOT_BTN_TEXT["SEARCH"] = "\u05D7\u05D9\u05E4\u05D5\u05E9";
    FORGOT_BTN_TEXT["RESET_PASSWORD"] = "\u05D0\u05D9\u05E4\u05D5\u05E1 \u05E1\u05D9\u05E1\u05DE\u05D0";
})(FORGOT_BTN_TEXT || (FORGOT_BTN_TEXT = {}));
var ForgotUser = /** @class */ (function () {
    function ForgotUser() {
        this.email = "";
        this.code = "";
        this.newPassword = "";
        this.showResetCodeField = false;
        this.hasResetCode = false;
        this.forgotBtnText = FORGOT_BTN_TEXT.SEARCH;
    }
    return ForgotUser;
}());
exports.ForgotUser = ForgotUser;
var LoginComponent = /** @class */ (function () {
    function LoginComponent(router, alertService, snackbarService, microtextService, globalService, loginService, forgotPasswordService) {
        this.router = router;
        this.alertService = alertService;
        this.snackbarService = snackbarService;
        this.microtextService = microtextService;
        this.globalService = globalService;
        this.loginService = loginService;
        this.forgotPasswordService = forgotPasswordService;
        this.user = new User();
        this.newUser = new NewUser();
        this.forgotUser = new ForgotUser();
        this.isLoading = false;
        // Login validation functions array.
        this.loginValidationFuncs = [
            {
                isFieldValid: function (user) {
                    return (user.email ? true : false);
                },
                errMsg: "יש להזין כתובת אימייל",
                fieldId: "login-email-micro",
                inputId: "login-email"
            },
            {
                isFieldValid: function (user, userRegexp) {
                    var emailPattern = userRegexp.email;
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
        this.registerValidationFuncs = [
            {
                isFieldValid: function (newUser) {
                    return (newUser.firstName ? true : false);
                },
                errMsg: "יש להזין שם פרטי",
                fieldId: "register-firstName-micro",
                inputId: "register-firstName"
            },
            {
                isFieldValid: function (newUser, userRegexp) {
                    var namePattern = userRegexp.name;
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
                isFieldValid: function (newUser, userRegexp) {
                    var namePattern = userRegexp.name;
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
                isFieldValid: function (newUser, userRegexp) {
                    var emailPattern = userRegexp.email;
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
        // Forgot password validation functions array.
        this.forgotValidationFuncs = [
            {
                isFieldValid: function (forgotUser) {
                    return (forgotUser.email ? true : false);
                },
                errMsg: "יש להזין כתובת אימייל",
                fieldId: "forgot-email-micro",
                inputId: "forgot-email"
            },
            {
                isFieldValid: function (forgotUser, userRegexp) {
                    var emailPattern = userRegexp.email;
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
    }
    // Running on the array of validation functions and make sure all valid.
    // Getting validation array and object to valid.
    LoginComponent.prototype.Validation = function (validations, obj, regex) {
        return this.microtextService.Validation(validations, obj, regex);
    };
    // Login user and redirect him to main page.
    LoginComponent.prototype.Login = function () {
        var _this = this;
        this.user.email = this.user.email.trim();
        // In case the login fields are valid.
        if (this.Validation(this.loginValidationFuncs, this.user, regexpEnums_1.UserRegexp)) {
            this.isLoading = true;
            var self = this;
            this.loginService.Login(this.user).then(function (data) {
                var result = data ? data.result : null;
                _this.isLoading = false;
                // In case of server error.
                if (result == null) {
                    _this.snackbarService.Snackbar("אירעה שגיאה בחיבור לשרת");
                }
                // In case the login details is incorrect.
                else if (result == false) {
                    _this.snackbarService.Snackbar("שם המשתמש או הסיסמא שגויים");
                }
                // In case the user was not found.
                else if (result == "-1") {
                    _this.alertService.Alert({
                        title: "משתמש לא קיים במערכת",
                        text: "האם ברצונך להרשם?",
                        type: "info",
                        confirmBtnText: "כן",
                        cancelBtnText: "לא",
                        confirmFunc: function () {
                            $("#register-modal").modal("show");
                            var userEmail = self.user.email;
                            self.OpenModal();
                            self.newUser.email = userEmail;
                        }
                    });
                }
                else {
                    // In case the user is locked via brute attack.
                    if (result.lock) {
                        _this.snackbarService.Snackbar("החשבון ננעל למשך " + result.lock + " דקות");
                    }
                    // In case the user is blocked.
                    else if (result.block) {
                        _this.alertService.Alert({
                            title: "משתמש חסום",
                            text: "<b>סיבה: </b>" + result.block.reason + "\n" +
                                "<b>עד תאריך: </b>" + (result.block.unblockDate ? result.block.unblockDate : "בלתי מוגבל"),
                            type: "warning",
                            showCancelButton: false
                        });
                    }
                    else {
                        // Show the loader again because the gurd validates the token.
                        _this.snackbarService.HideSnackbar();
                        _this.isLoading = true;
                        _this.router.navigateByUrl('');
                    }
                }
            });
        }
    };
    // Regiter the new user to the DB.
    LoginComponent.prototype.Register = function () {
        var _this = this;
        this.newUser.firstName = this.newUser.firstName.trim();
        this.newUser.lastName = this.newUser.lastName.trim();
        this.newUser.email = this.newUser.email.trim();
        // In case the register modal fields are valid.
        if (this.Validation(this.registerValidationFuncs, this.newUser, regexpEnums_1.UserRegexp)) {
            this.isLoading = true;
            this.loginService.Register(this.newUser).then(function (data) {
                var result = data ? data.result : null;
                _this.isLoading = false;
                // In case of server error.
                if (result == null) {
                    _this.snackbarService.Snackbar("אירעה שגיאה בחיבור לשרת");
                }
                // In case the email is already exists.
                else if (result == false) {
                    // Show microtext of the email field. 
                    $("#register-email-micro").html("אימייל זה נמצא בשימוש");
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
        this.forgotUser.email = this.forgotUser.email.trim();
        // In case the forgot modal fields are valid.
        if (this.Validation(this.forgotValidationFuncs, this.forgotUser, regexpEnums_1.UserRegexp)) {
            this.isLoading = true;
            // In case the user is in the first stage of reset password.
            if (this.forgotUser.showResetCodeField == false) {
                this.forgotPasswordService.Forgot(this.forgotUser.email).then(function (data) {
                    var result = data ? data.result : null;
                    _this.isLoading = false;
                    // In case of server error.
                    if (result == null) {
                        _this.snackbarService.Snackbar("אירעה שגיאה בחיבור לשרת");
                    }
                    // In case the user was not found.
                    else if (result == false) {
                        // Show microtext of the email field. 
                        $("#forgot-email-micro").html("אימייל זה לא קיים במערכת");
                    }
                    // In case the user was found.
                    else {
                        _this.forgotUser.showResetCodeField = true;
                        _this.forgotUser.forgotBtnText = FORGOT_BTN_TEXT.RESET_PASSWORD;
                        _this.snackbarService.Snackbar("קוד לאיפוס הסיסמא נשלח לאימייל שלך");
                    }
                });
            }
            // In case the user is in the second stage of reset password.
            else {
                this.forgotPasswordService.ResetPassword(this.forgotUser).then(function (data) {
                    var result = data ? data.result : null;
                    _this.isLoading = false;
                    // In case of server error.
                    if (result == null) {
                        _this.snackbarService.Snackbar("אירעה שגיאה בחיבור לשרת");
                    }
                    // In case the email was not found.
                    else if (result == false || result.emailNotFound) {
                        $("#forgot-email-micro").html("אימייל זה לא קיים במערכת");
                    }
                    // In case the reset code is not exists.
                    else if (result.codeNotFound) {
                        $("#forgot-code-micro").html("הקוד שהוזן לא נמצא");
                    }
                    // In case the reset code is lock with max tries or already been used.
                    else if (result.maxTry || result.codeIsUsed) {
                        $("#forgot-code-micro").html("קוד זה נעול");
                    }
                    // In case the reset code is expired.
                    else if (result.codeIsExpired) {
                        $("#forgot-code-micro").html("פג תוקפו של הקוד שהוזן");
                    }
                    // In case the reset code is wrong.
                    else if (result.codeNotValid) {
                        $("#forgot-code-micro").html("הקוד שהוזן שגוי");
                    }
                    // In case the password has been changed.
                    else {
                        $("#forgot-modal").modal('hide');
                        var self = _this;
                        self.globalService.CallSocketFunction('LogoutUserSessionServer', [null, "תוקף הסיסמא פג, יש להתחבר מחדש"]);
                        self.alertService.Alert({
                            title: "איפוס סיסמא",
                            text: "הסיסמא הוחלפה בהצלחה!",
                            showCancelButton: false,
                            type: "success",
                            confirmFunc: function () {
                                self.router.navigateByUrl('');
                            }
                        });
                    }
                });
            }
        }
    };
    LoginComponent.prototype.hasResetCode = function () {
        this.forgotUser.hasResetCode = true;
        this.forgotUser.showResetCodeField = true;
        this.forgotUser.forgotBtnText = FORGOT_BTN_TEXT.RESET_PASSWORD;
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
        if (event.key == "Enter" || event.key == "NumpadEnter") {
            $(".user-input").blur();
            this.Login();
        }
    };
    // Key up in register modal.
    LoginComponent.prototype.RegisterKeyUp = function (event) {
        // In case the key is enter.
        if (event.key == "Enter" || event.key == "NumpadEnter") {
            $(".user-input").blur();
            this.Register();
        }
    };
    // Key up in forgot modal.
    LoginComponent.prototype.ForgotKeyUp = function (event) {
        // In case the key is enter.
        if (event.key == "Enter" || event.key == "NumpadEnter") {
            $(".user-input").blur();
            this.ResetPassword();
        }
    };
    // Hide microtext in a specific field.
    LoginComponent.prototype.HideMicrotext = function (microtextId) {
        this.microtextService.HideMicrotext(microtextId);
    };
    // Check if object is in array.
    LoginComponent.prototype.IsInArray = function (array, value) {
        // Running on all the array.
        for (var i = 0; i < array.length; i++) {
            // In case the value is in the array.
            if (array[i] === value) {
                return true;
            }
        }
        return false;
    };
    LoginComponent = __decorate([
        core_1.Component({
            selector: 'login',
            templateUrl: './login.html',
            providers: [login_service_1.LoginService, forgotPassword_service_1.ForgotPasswordService]
        }),
        __metadata("design:paramtypes", [router_1.Router,
            alert_service_1.AlertService,
            snackbar_service_1.SnackbarService,
            microtext_service_1.MicrotextService,
            global_service_1.GlobalService,
            login_service_1.LoginService,
            forgotPassword_service_1.ForgotPasswordService])
    ], LoginComponent);
    return LoginComponent;
}());
exports.LoginComponent = LoginComponent;
//# sourceMappingURL=login.component.js.map