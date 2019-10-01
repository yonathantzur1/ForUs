import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { SocketService } from '../../../services/global/socket.service';
import { EventService } from '../../../services/global/event.service';
import { SnackbarService } from '../../../services/global/snackbar.service';
import { MicrotextService, InputFieldValidation } from '../../../services/global/microtext.service';

import { ForgotService } from '../../../services/welcome/forgot.service';

import { UserRegexp } from '../../../regex/regexpEnums';

declare let $: any;

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
    selector: 'forgot',
    templateUrl: './forgot.html',
    providers: [ForgotService],
    styleUrls: ['./forgot.css', '../welcome.css']
})

export class ForgotComponent {
    validationFuncs: Array<InputFieldValidation>;

    forgotUser: ForgotUser = new ForgotUser();
    isLoading: boolean = false;

    constructor(private router: Router,
        public snackbarService: SnackbarService,
        private microtextService: MicrotextService,
        private socketService: SocketService,
        public eventService: EventService,
        private forgotService: ForgotService) {
        this.validationFuncs = [
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
    }

    // Send mail with reset code to the user.
    ResetPassword() {
        this.forgotUser.email = this.forgotUser.email.trim();

        // In case the forgot modal fields are valid.
        if (this.microtextService.Validation(this.validationFuncs, this.forgotUser, UserRegexp)) {
            this.isLoading = true;

            // In case the user is in the first stage of reset password.
            if (this.forgotUser.showResetCodeField == false) {
                this.forgotService.ForgotPasswordRequest(this.forgotUser.email).then((data: any) => {
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
                this.forgotService.ResetPassword(this.forgotUser).then((data: any) => {
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

                        self.socketService.SocketEmit('LogoutUserSessionServer',
                            null,
                            "תוקף הסיסמא פג, יש להתחבר מחדש");

                        this.snackbarService.Snackbar("הסיסמא הוחלפה בהצלחה");
                        self.router.navigateByUrl('');
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

    ForgotEnter() {
        $(".user-input").blur();
        this.ResetPassword();
    }

    // Hide microtext in a specific field.
    HideMicrotext(microtextId: string) {
        this.microtextService.HideMicrotext(microtextId);
    }
}