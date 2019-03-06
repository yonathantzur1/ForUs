import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AlertService, ALERT_TYPE } from '../../../../services/alert/alert.service';
import { MicrotextService, InputFieldValidation } from '../../../../services/microtext/microtext.service';
import { GlobalService } from '../../../../services/global/global.service';

import { DeleteUserService } from '../../services/deleteUser/deleteUser.service';

@Component({
    selector: 'deleteUser',
    templateUrl: './deleteUser.html',
    providers: [DeleteUserService],
    styleUrls: ['./deleteUser.css']
})

export class DeleteUserComponent implements OnInit {
    deleteUserToken: string;
    userName: string;
    password: string;
    isDeleteTokenValid: boolean;

    // Validation functions array.
    passwordValidations: Array<InputFieldValidation> = [
        {
            isFieldValid(password: string) {
                return (password ? true : false);
            },
            errMsg: "יש להזין סיסמא",
            fieldId: "password-micro",
            inputId: "password"
        }
    ];

    constructor(private router: Router,
        private route: ActivatedRoute,
        private alertService: AlertService,
        private microtextService: MicrotextService,
        private deleteUserService: DeleteUserService) { }

    ngOnInit() {
        // In case of route params changes.
        this.route.params.subscribe(params => {
            this.deleteUserToken = params["passToken"];

            this.deleteUserService.ValidateDeleteUserToken(this.deleteUserToken)
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

    BackToLogin() {
        this.router.navigateByUrl('/login');
    }

    DeleteUser() {
        if (!this.microtextService.Validation(this.passwordValidations, this.password)) {
            return;
        }

        this.deleteUserService.DeleteAccount(this.deleteUserToken, this.password).then(result => {
            if (result) {
                this.alertService.Alert({
                    title: "מחיקת משתמש",
                    text: "מחיקת המשתמש שלך בוצעה בהצלחה",
                    showCancelButton: false,
                    type: ALERT_TYPE.INFO
                });
                
                this.BackToLogin();
            }
            else if (result == false) {
                this.microtextService.ShowMicrotext("password-micro", "סיסמא שגוייה");
            }
            else {
                this.alertService.Alert({
                    title: "שגיאה",
                    text: "אופס... שגיאה בתהליך מחיקת המשתמש",
                    showCancelButton: false,
                    type: ALERT_TYPE.DANGER
                });
            }
        });
    }

    CheckForEnter(event: any) {
        // In case the key is enter.
        if (event.key == "Enter" || event.key == "NumpadEnter") {
            this.DeleteUser();
        }
    }

    // Hide microtext in a specific field.
    HideMicrotext(microtextId: string) {
        this.microtextService.HideMicrotext(microtextId);
    }

}