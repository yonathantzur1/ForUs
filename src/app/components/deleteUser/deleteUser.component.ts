import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AlertService, ALERT_TYPE } from '../../services/global/alert.service';
import { MicrotextService, InputFieldValidation } from '../../services/global/microtext.service';

import { DeleteUserService } from '../../services/deleteUser.service';

@Component({
    selector: 'deleteUser',
    templateUrl: './deleteUser.html',
    providers: [DeleteUserService],
    styleUrls: ['./deleteUser.css']
})

export class DeleteUserComponent implements OnInit {
    validationFuncs: Array<InputFieldValidation>;

    deleteUserToken: string;
    userName: string;
    password: string;
    isDeleteTokenValid: boolean;

    constructor(private router: Router,
        private route: ActivatedRoute,
        public alertService: AlertService,
        private microtextService: MicrotextService,
        private deleteUserService: DeleteUserService) {
        this.validationFuncs = [
            {
                isFieldValid(password: string) {
                    return !!password;
                },
                errMsg: "יש להזין סיסמא",
                fieldId: "password-micro",
                inputId: "password"
            }
        ];
    }

    ngOnInit() {
        // In case of route params changes.
        this.route.params.subscribe(params => {
            this.deleteUserToken = params["passToken"];

            this.deleteUserService.validateDeleteUserToken(this.deleteUserToken)
                .then((result: any) => {
                    if (result) {
                        this.isDeleteTokenValid = true;
                        this.userName = result.name;
                    }
                    else {
                        this.isDeleteTokenValid = false;
                    }
                });
        });
    }

    backToLogin() {
        this.router.navigateByUrl('/login');
    }

    deleteUser() {
        if (!this.microtextService.validation(this.validationFuncs, this.password)) {
            return;
        }

        this.deleteUserService.deleteAccount(this.deleteUserToken, this.password).then(result => {
            if (result) {
                this.alertService.alert({
                    title: "מחיקת משתמש",
                    text: "מחיקת המשתמש שלך בוצעה בהצלחה.",
                    showCancelButton: false,
                    type: ALERT_TYPE.INFO
                });

                this.backToLogin();
            }
            else if (result == false) {
                this.microtextService.showMicrotext("password-micro", "הסיסמא שהוזנה שגוייה");
            }
            else {
                this.alertService.alert({
                    title: "שגיאה",
                    text: "אופס... שגיאה בתהליך מחיקת המשתמש",
                    showCancelButton: false,
                    type: ALERT_TYPE.DANGER
                });
            }
        });
    }

    // Hide microtext in a specific field.
    hideMicrotext(microtextId: string) {
        this.microtextService.hideMicrotext(microtextId);
    }
}