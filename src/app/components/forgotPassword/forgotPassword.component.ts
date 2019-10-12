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
                    return (newPassword ? true : false);
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
        if (!this.microtextService.Validation(this.validationFuncs, this.newPassword)) {
            return;
        }

        this.forgotPasswordService.ResetPasswordByToken(this.resetPasswordToken, this.newPassword)
            .then((result: boolean) => {
                let self = this;

                if (result) {
                    self.socketService.SocketEmit('LogoutUserSessionServer',
                        "תוקף הסיסמא פג, יש להתחבר מחדש");

                    this.snackbarService.Snackbar("הסיסמא הוחלפה בהצלחה");
                    self.router.navigateByUrl('/login');
                }
                else {
                    this.snackbarService.Snackbar("אירעה שגיאה בחיבור לשרת");
                }
            });
    }

    // Hide microtext in a specific field.
    HideMicrotext(microtextId: string) {
        this.microtextService.HideMicrotext(microtextId);
    }
}