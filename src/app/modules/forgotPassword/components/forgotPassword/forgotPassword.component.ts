import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AlertService, ALERT_TYPE } from '../../../../services/alert/alert.service';
import { MicrotextService, InputFieldValidation } from '../../../../services/microtext/microtext.service';
import { GlobalService } from '../../../../services/global/global.service';

import { ForgotPasswordService } from '../../services/forgotPassword/forgotPassword.service';

@Component({
    selector: 'forgotPassword',
    templateUrl: './forgotPassword.html',
    providers: [ForgotPasswordService],
    styleUrls: ['./forgotPassword.css']
})

export class ForgotPasswordComponent implements OnInit {
    resetPasswordToken: string;
    newPassword: string;
    isResetTokenValid: boolean;
    userName: string;

    // Validation functions array.
    newPasswordValidations: Array<InputFieldValidation> = [
        {
            isFieldValid(newPassword: string) {
                return (newPassword ? true : false);
            },
            errMsg: "יש להזין סיסמא חדשה",
            fieldId: "new-password-micro",
            inputId: "new-password"
        }
    ];

    constructor(private router: Router,
        private route: ActivatedRoute,
        public alertService: AlertService,
        private microtextService: MicrotextService,
        public globalService: GlobalService,
        private forgotPasswordService: ForgotPasswordService) { }

    ngOnInit() {
        // In case of route params changes.
        this.route.params.subscribe(params => {
            this.resetPasswordToken = params["passToken"];

            this.forgotPasswordService.ValidateResetPasswordToken(this.resetPasswordToken)
                .then((result: any) => {
                    if (result) {
                        this.isResetTokenValid = true;
                        this.userName = result.name;
                    }
                    else {
                        this.isResetTokenValid = false;
                    }
                });
        });
    }

    BackToLogin() {
        this.router.navigateByUrl('/login');
    }

    ResetPassword() {
        if (!this.microtextService.Validation(this.newPasswordValidations, this.newPassword)) {
            return;
        }

        this.forgotPasswordService.ResetPasswordByToken(this.resetPasswordToken, this.newPassword)
            .then((result: boolean) => {
                let self = this;

                if (result) {
                    self.globalService.CallSocketFunction('LogoutUserSessionServer',
                        [null, "תוקף הסיסמא פג, יש להתחבר מחדש"]);

                    self.alertService.Alert({
                        title: "איפוס סיסמא",
                        text: "הסיסמא הוחלפה בהצלחה!",
                        showCancelButton: false,
                        type: ALERT_TYPE.INFO,
                        confirmFunc: function () {
                            self.router.navigateByUrl('/login');
                        }
                    });
                }
                else {
                    self.alertService.Alert({
                        title: "איפוס סיסמא",
                        text: "אופס... שגיאה באיפוס הסיסמא",
                        showCancelButton: false,
                        type: ALERT_TYPE.DANGER
                    });
                }
            });
    }

    CheckForEnter(event: any) {
        // In case the key is enter.
        if (event.key == "Enter" || event.key == "NumpadEnter") {
            this.ResetPassword();
        }
    }

    // Hide microtext in a specific field.
    HideMicrotext(microtextId: string) {
        this.microtextService.HideMicrotext(microtextId);
    }
}