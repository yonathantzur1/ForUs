import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { GlobalService } from '../../../services/global/global.service';
import { EventService } from '../../../services/event/event.service';
import { AlertService, ALERT_TYPE } from '../../../services/alert/alert.service';
import { SnackbarService } from '../../../services/snackbar/snackbar.service';
import { MicrotextService, InputFieldValidation } from '../../../services/microtext/microtext.service';

import { LoginService } from '../../../services/welcome/login/login.service';

import { UserRegexp } from '../../../regex/regexpEnums';

declare let $: any;

export class User {
    email: string = '';
    password: string = '';
}

enum FORGOT_BTN_TEXT {
    SEARCH = "חיפוש",
    RESET_PASSWORD = "איפוס סיסמא"
}

export class ForgotUser {
    email: string;
    code: string;
    newPassword: string;
    showResetCodeField: boolean;
    hasResetCode: boolean;
    forgotBtnText: string;

    constructor() {
        this.email = '';
        this.code = '';
        this.newPassword = '';
        this.showResetCodeField = false;
        this.hasResetCode = false;
        this.forgotBtnText = FORGOT_BTN_TEXT.SEARCH;
    }
}

@Component({
    selector: 'login',
    templateUrl: './login.html',
    providers: [LoginService],
    styleUrls: ['./login.css', '../welcome.css']
})

export class LoginComponent {
    user: User = new User();
    forgotUser: ForgotUser = new ForgotUser();
    isLoading: boolean = false;

    // Validation functions array.
    loginValidationFuncs: Array<InputFieldValidation> = [
        {
            isFieldValid(user: User) {
                return (user.email ? true : false);
            },
            errMsg: "יש להזין כתובת אימייל",
            fieldId: "login-email-micro",
            inputId: "login-email"
        },
        {
            isFieldValid(user: User, userRegexp: any) {
                let emailPattern = userRegexp.email;
                return (emailPattern.test(user.email));
            },
            errMsg: "כתובת אימייל לא תקינה",
            fieldId: "login-email-micro",
            inputId: "login-email"
        },
        {
            isFieldValid(user: User) {
                return (user.password ? true : false);
            },
            errMsg: "יש להזין סיסמא",
            fieldId: "login-password-micro",
            inputId: "login-password"
        }
    ];

    // Forgot password validation functions array.
    forgotValidationFuncs: Array<InputFieldValidation> = [
        {
            isFieldValid(forgotUser: ForgotUser) {
                return (forgotUser.email ? true : false);
            },
            errMsg: "יש להזין כתובת אימייל",
            fieldId: "forgot-email-micro",
            inputId: "forgot-email"
        },
        {
            isFieldValid(forgotUser: ForgotUser, userRegexp: any) {
                let emailPattern = userRegexp.email;

                return (emailPattern.test(forgotUser.email));
            },
            errMsg: "כתובת אימייל לא תקינה",
            fieldId: "forgot-email-micro",
            inputId: "forgot-email"
        },
        {
            isFieldValid(forgotUser: ForgotUser) {
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
            isFieldValid(forgotUser: ForgotUser) {
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

    constructor(private router: Router,
        public alertService: AlertService,
        public snackbarService: SnackbarService,
        private microtextService: MicrotextService,
        public globalService: GlobalService,
        public eventService: EventService,
        private loginService: LoginService) { }

    // Login user and redirect him to main page.
    Login() {
        this.user.email = this.user.email.trim();

        // In case the login fields are valid.
        if (this.microtextService.Validation(this.loginValidationFuncs, this.user, UserRegexp)) {
            this.isLoading = true;
            let self = this;

            this.loginService.Login(this.user).then((data: any) => {
                let result = data ? data.result : null;
                this.isLoading = false;

                // In case of server error.
                if (result == null) {
                    this.snackbarService.Snackbar("אירעה שגיאה בחיבור לשרת");
                }
                // In case the login details is incorrect.
                else if (result == false) {
                    this.snackbarService.Snackbar("שם המשתמש או הסיסמא שגויים");
                }
                // In case the user was not found.
                else if (result == "-1") {
                    this.alertService.Alert({
                        title: "משתמש לא קיים במערכת",
                        text: "האם ברצונך להרשם?",
                        type: ALERT_TYPE.INFO,
                        confirmBtnText: "כן",
                        cancelBtnText: "לא",
                        confirmFunc: function () {
                            self.eventService.Emit("setRegisterEmail", self.user.email);
                            self.router.navigateByUrl('/register');
                        }
                    });
                }
                else {
                    // In case the user is locked via brute attack.
                    if (result.lock) {
                        this.snackbarService.Snackbar("החשבון ננעל למשך " + result.lock + " דקות");
                    }
                    // In case the user is blocked.
                    else if (result.block) {
                        this.alertService.Alert({
                            title: "משתמש חסום",
                            text: "<b>סיבה: </b>" + result.block.reason + "\n" +
                                "<b>עד תאריך: </b>" + (result.block.unblockDate ? result.block.unblockDate : "בלתי מוגבל"),
                            type: ALERT_TYPE.WARNING,
                            showCancelButton: false
                        });
                    }
                    else {
                        // Show the loader again because the gurd validates the token.
                        this.snackbarService.HideSnackbar();
                        this.isLoading = true;
                        this.router.navigateByUrl('');
                    }
                }
            });
        }
    }

    // Send mail with reset code to the user.
    ResetPassword() {
        this.forgotUser.email = this.forgotUser.email.trim();

        // In case the forgot modal fields are valid.
        if (this.microtextService.Validation(this.forgotValidationFuncs, this.forgotUser, UserRegexp)) {
            this.isLoading = true;

            // In case the user is in the first stage of reset password.
            if (this.forgotUser.showResetCodeField == false) {
                this.loginService.ForgotPasswordRequest(this.forgotUser.email).then((data: any) => {
                    let result = data ? data.result : null;
                    this.isLoading = false;

                    // In case of server error.
                    if (result == null) {
                        this.snackbarService.Snackbar("אירעה שגיאה בחיבור לשרת");
                    }
                    // In case the user was not found.
                    else if (result == false) {
                        // Show microtext of the email field. 
                        $("#forgot-email-micro").html("אימייל זה לא קיים במערכת");
                    }
                    // In case the user was found.
                    else {
                        this.forgotUser.showResetCodeField = true;
                        this.forgotUser.forgotBtnText = FORGOT_BTN_TEXT.RESET_PASSWORD;
                        this.snackbarService.Snackbar("קוד לאיפוס הסיסמא נשלח לאימייל שלך");
                    }
                });
            }
            // In case the user is in the second stage of reset password.
            else {
                this.loginService.ResetPassword(this.forgotUser).then((data: any) => {
                    let result = data ? data.result : null;
                    this.isLoading = false;

                    // In case of server error.
                    if (result == null) {
                        this.snackbarService.Snackbar("אירעה שגיאה בחיבור לשרת");
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

                        let self = this;

                        self.globalService.CallSocketFunction('LogoutUserSessionServer',
                            [null, "תוקף הסיסמא פג, יש להתחבר מחדש"]);

                        self.alertService.Alert({
                            title: "איפוס סיסמא",
                            text: "הסיסמא הוחלפה בהצלחה!",
                            showCancelButton: false,
                            type: ALERT_TYPE.INFO,
                            confirmFunc: function () {
                                self.router.navigateByUrl('');
                            }
                        });
                    }
                });
            }
        }
    }

    hasResetCode() {
        this.forgotUser.hasResetCode = true;
        this.forgotUser.showResetCodeField = true;
        this.forgotUser.forgotBtnText = FORGOT_BTN_TEXT.RESET_PASSWORD;
        $(".microtext").html('');
    }

    // Key up in login.
    LoginKeyUp(event: any) {
        // In case the key is enter.
        if (event.key == "Enter" || event.key == "NumpadEnter") {
            $(".user-input").blur();
            this.Login();
        }
    }

    // Key up in forgot modal.
    ForgotKeyUp(event: any) {
        // In case the key is enter.
        if (event.key == "Enter" || event.key == "NumpadEnter") {
            $(".user-input").blur();
            this.ResetPassword();
        }
    }

    // Hide microtext in a specific field.
    HideMicrotext(microtextId: string) {
        this.microtextService.HideMicrotext(microtextId);
    }

    // Check if object is in array.
    IsInArray(array: any[], value: any): boolean {
        // Running on all the array.
        for (let i = 0; i < array.length; i++) {
            // In case the value is in the array.
            if (array[i] === value) {
                return true;
            }
        }

        return false;
    }
}