import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { EventService } from '../../../services/global/event.service';
import { AlertService, ALERT_TYPE } from '../../../services/global/alert.service';
import { SnackbarService } from '../../../services/global/snackbar.service';
import { MicrotextService, InputFieldValidation } from '../../../services/global/microtext.service';

import { LoginService } from '../../../services/welcome/login.service';
import { GlobalService } from 'src/app/services/global/global.service';

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
        public eventService: EventService,
        private loginService: LoginService,
        private globalService: GlobalService) {
        this.validationFuncs = [
            {
                isFieldValid(user: User) {
                    return !!user.email;
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
                    return !!user.password;
                },
                errMsg: "יש להזין סיסמא",
                fieldId: "login-password-micro",
                inputId: "login-password"
            }
        ];
    }

    // Login user and redirect him to main page.
    login() {
        this.user.email = this.user.email.trim();

        // In case the login fields are valid.
        if (this.microtextService.validation(this.validationFuncs, this.user, UserRegexp)) {
            this.isLoading = true;
            let self = this;

            this.loginService.login(this.user).then((data: any) => {
                let result = data ? data.result : null;
                this.isLoading = false;

                // In case of server error.
                if (result == null) {
                    this.snackbarService.snackbar("אירעה שגיאה בחיבור לשרת");
                }
                // In case the login details is incorrect.
                else if (result == false) {
                    this.snackbarService.snackbar("שם המשתמש או הסיסמא שגויים");
                }
                // In case the user was not found.
                else if (result == "-1") {
                    this.alertService.alert({
                        title: "משתמש לא קיים במערכת",
                        text: "האם ברצונך להרשם?",
                        type: ALERT_TYPE.INFO,
                        confirmBtnText: "כן",
                        cancelBtnText: "לא",
                        confirmFunc: function () {
                            self.globalService.setData("registerEmail", self.user.email);
                            self.router.navigateByUrl('/register');
                        }
                    });
                }
                else {
                    // In case the user is locked via brute attack.
                    if (result.lock) {
                        let lockTimeStr = (result.lock == 1) ? "דקה" : result.lock + " דקות";
                        this.snackbarService.snackbar("החשבון ננעל למשך " + lockTimeStr);
                    }
                    // In case the user is blocked.
                    else if (result.block) {
                        this.alertService.alert({
                            title: "משתמש חסום",
                            text: "<b>סיבה: </b>" + result.block.reason + "\n" +
                                "<b>עד תאריך: </b>" + (result.block.unblockDate ? result.block.unblockDate : "בלתי מוגבל"),
                            type: ALERT_TYPE.WARNING,
                            showCancelButton: false
                        });
                    }
                    else {
                        // Show the loader again because the guard validates the token.
                        this.snackbarService.hideSnackbar();
                        this.isLoading = true;
                        this.router.navigateByUrl('');
                    }
                }
            });
        }
    }

    loginEnter() {
        $(".user-input").blur();
        this.login();
    }

    // Hide microtext in a specific field.
    hideMicrotext(microtextId: string) {
        this.microtextService.hideMicrotext(microtextId);
    }
}