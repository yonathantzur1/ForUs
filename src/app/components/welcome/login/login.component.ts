import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { GlobalService } from '../../../services/global/global.service';
import { EventService } from '../../../services/event/event.service';
import { AlertService, ALERT_TYPE } from '../../../services/alert/alert.service';
import { SnackbarService } from '../../../services/snackbar/snackbar.service';
import { MicrotextService, InputFieldValidation } from '../../../services/microtext/microtext.service';

import { LoginService } from '../../../services/welcome/login.service';

import { UserRegexp } from '../../../regex/regexpEnums';

declare let $: any;

export class User {
    email: string = '';
    password: string = '';
}

@Component({
    selector: 'login',
    templateUrl: './login.html',
    providers: [LoginService],
    styleUrls: ['./login.css', '../welcome.css']
})

export class LoginComponent {
    user: User = new User();
    isLoading: boolean = false;
    validationFuncs: Array<InputFieldValidation>;

    constructor(private router: Router,
        public alertService: AlertService,
        public snackbarService: SnackbarService,
        private microtextService: MicrotextService,
        public globalService: GlobalService,
        public eventService: EventService,
        private loginService: LoginService) {
        this.validationFuncs = [
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
    }

    // Login user and redirect him to main page.
    Login() {
        this.user.email = this.user.email.trim();

        // In case the login fields are valid.
        if (this.microtextService.Validation(this.validationFuncs, this.user, UserRegexp)) {
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

    LoginEnter() {
        $(".user-input").blur();
        this.Login();
    }

    // Hide microtext in a specific field.
    HideMicrotext(microtextId: string) {
        this.microtextService.HideMicrotext(microtextId);
    }
}