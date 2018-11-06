import { Component, Input } from '@angular/core';

import { UserPasswordWindowService } from '../../../services/userPage/userPasswordWindow/userPasswordWindow.service';
import { AlertService, ALERT_TYPE } from '../../../services/alert/alert.service';
import { GlobalService } from '../../../services/global/global.service';
import { MicrotextService, InputFieldValidation } from '../../../services/microtext/microtext.service';

import { USER_UPDATE_INFO_ERROR } from '../../../enums/enums'

export class Password {
    oldPassword: string;
    newPassword: string;

    constructor() {
        this.oldPassword = "";
        this.newPassword = "";
    }
}

@Component({
    selector: 'userPasswordWindow',
    templateUrl: './userPasswordWindow.html',
    providers: [UserPasswordWindowService]
})

export class UserPasswordWindowComponent {
    @Input() userId: string;
    password: Password = new Password();

    // Login validation functions array.
    validationFuncs: Array<InputFieldValidation> = [
        {
            isFieldValid(password: Password) {
                return password.oldPassword ? true : false;
            },
            errMsg: "יש להזין סיסמא נוכחית",
            fieldId: "old-password-micro",
            inputId: "oldPassword"
        },
        {
            isFieldValid(password: Password) {
                return password.newPassword ? true : false;
            },
            errMsg: "יש להזין סיסמא חדשה",
            fieldId: "new-password-micro",
            inputId: "newPassword"
        }
    ]

    constructor(private globalService: GlobalService,
        private alertService: AlertService,
        private microtextService: MicrotextService,
        private userPasswordWindowService: UserPasswordWindowService) { }

    CloseWindow() {
        this.globalService.setData("closeUserPasswordWindow", true);
    }

    // Hide microtext in a specific field.
    HideMicrotext(microtextId: string) {
        this.microtextService.HideMicrotext(microtextId);
    }

    ChangePassword() {
        if (this.microtextService.Validation(this.validationFuncs, this.password)) {
            this.userPasswordWindowService.UpdateUserPassword(this.password).then(result => {
                if (result) {
                    if (result.lock) {
                        this.microtextService.ShowMicrotext("old-password-micro",
                            "העדכון ננעל למשך " + result.lock + " דקות");
                    }
                    else if (result == USER_UPDATE_INFO_ERROR.WRONG_PASSWORD) {
                        this.microtextService.ShowMicrotext("old-password-micro", "הסיסמא שהוזנה שגוייה");
                    }
                    else {
                        this.CloseWindow();
                        this.globalService.socket.emit("LogoutUserSessionServer", this.userId, "הסיסמא התעדכנה בהצלחה!\nיש להיכנס מחדש.");
                    }
                }
                else {
                    this.ChangePasswordErrorAlert();
                }
            });
        }
    }

    ChangePasswordByMail() {
        this.userPasswordWindowService.ChangePasswordByMail().then(result => {
            this.CloseWindow();
            
            if (result) {
                this.alertService.Alert({
                    title: "שינוי סיסמא",
                    text: "יש להיכנס לקישור שנשלח לכתובת האימייל שלך.",
                    type: ALERT_TYPE.SUCCESS,
                    showCancelButton: false
                });
            }
            else {
                this.ChangePasswordErrorAlert();
            }
        });
    }

    ChangePasswordErrorAlert() {
        this.alertService.Alert({
            title: "שינוי סיסמא",
            text: "אופס... אירעה שגיאה בשינוי הסיסמא",
            type: ALERT_TYPE.DANGER,
            showCancelButton: false
        });
    }
}