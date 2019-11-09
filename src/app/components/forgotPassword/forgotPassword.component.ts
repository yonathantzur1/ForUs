import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { SnackbarService } from '../../services/global/snackbar.service';
import { MicrotextService, InputFieldValidation } from '../../services/global/microtext.service';
import { SocketService } from '../../services/global/socket.service';

import { ForgotService } from '../../services/welcome/forgot.service';

@Component({
    selector: 'forgotPassword',
    templateUrl: './forgotPassword.html',
    providers: [ForgotService],
    styleUrls: ['./forgotPassword.css']
})

export class ForgotPasswordComponent implements OnInit {
    validationFuncs: Array<InputFieldValidation>;

    resetPasswordToken: string;
    newPassword: string;
    isResetTokenValid: boolean;
    userName: string;

    constructor(private router: Router,
        private route: ActivatedRoute,
        public snackbarService: SnackbarService,
        private microtextService: MicrotextService,
        private socketService: SocketService,
        private forgotPasswordService: ForgotService) {
        this.validationFuncs = [
            {
                isFieldValid(newPassword: string) {
                    return !!newPassword;
                },
                errMsg: "יש להזין סיסמא חדשה",
                fieldId: "new-password-micro",
                inputId: "new-password"
            }
        ];
    }

    ngOnInit() {
        // In case of route params changes.
        this.route.params.subscribe(params => {
            this.resetPasswordToken = params["passToken"];

            this.forgotPasswordService.validateResetPasswordToken(this.resetPasswordToken)
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

    backToLogin() {
        this.router.navigateByUrl('/login');
    }

    resetPassword() {
        if (!this.microtextService.validation(this.validationFuncs, this.newPassword)) {
            return;
        }

        this.forgotPasswordService.resetPasswordByToken(this.resetPasswordToken, this.newPassword)
            .then((result: boolean) => {
                let self = this;

                if (result) {
                    self.socketService.socketEmit('LogoutUserSessionServer',
                        "תוקף הסיסמא פג, יש להתחבר מחדש");

                    this.snackbarService.snackbar("הסיסמא הוחלפה בהצלחה");
                    self.router.navigateByUrl('/login');
                }
                else {
                    this.snackbarService.snackbar("אירעה שגיאה בחיבור לשרת");
                }
            });
    }

    // Hide microtext in a specific field.
    hideMicrotext(microtextId: string) {
        this.microtextService.hideMicrotext(microtextId);
    }
}