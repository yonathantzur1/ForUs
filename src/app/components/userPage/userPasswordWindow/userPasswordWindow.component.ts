import { Component, Input, HostListener } from '@angular/core';

import { UserPasswordWindowService } from '../../../services/userPage/userPasswordWindow.service';
import { AlertService, ALERT_TYPE } from '../../../services/global/alert/alert.service';
import { GlobalService } from '../../../services/global/global.service';
import { EventService } from '../../../services/global/event/event.service';
import { MicrotextService, InputFieldValidation } from '../../../services/global/microtext/microtext.service';

import { USER_UPDATE_INFO_ERROR } from '../../../enums/enums'

export class Password {
    oldPassword: string;
    newPassword: string;

    constructor() {
        this.oldPassword = '';
        this.newPassword = '';
    }
}

@Component({
    selector: 'userPasswordWindow',
    templateUrl: './userPasswordWindow.html',
    providers: [UserPasswordWindowService],
    styleUrls: ['./userPasswordWindow.css', '../userWindow.css']
})

export class UserPasswordWindowComponent {
    validationFuncs: Array<InputFieldValidation>;

    @Input() userId: string;
    password: Password = new Password();

    constructor(public globalService: GlobalService,
        private eventService: EventService,
        public alertService: AlertService,
        private microtextService: MicrotextService,
        private userPasswordWindowService: UserPasswordWindowService) {
        this.validationFuncs = [
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
    }

    CloseWindow() {
        this.eventService.Emit("closeUserPasswordWindow");
    }

    // Hide microtext in a specific field.
    HideMicrotext(microtextId: string) {
        this.microtextService.HideMicrotext(microtextId);
    }

    @HostListener('document:keyup', ['$event'])
    KeyPress(event: any) {
        // In case of pressing escape.
        if (event.code == "Escape") {
            this.CloseWindow();
        }
        else if (event.code == "Enter" || event.code == "NumpadEnter") {
            this.ChangePassword();
        }
    }

    ChangePassword() {
        if (this.microtextService.Validation(this.validationFuncs, this.password)) {
            this.userPasswordWindowService.UpdateUserPassword(this.password).then(data => {
                if (data) {
                    let result = data.result;

                    if (result.lock) {
                        this.microtextService.ShowMicrotext("old-password-micro",
                            "העדכון ננעל למשך " + result.lock + " דקות");
                    }
                    else if (result == USER_UPDATE_INFO_ERROR.WRONG_PASSWORD) {
                        this.microtextService.ShowMicrotext("old-password-micro", "הסיסמא שהוזנה שגוייה");
                    }
                    else {
                        this.CloseWindow();
                        let updateMessage = "הסיסמא עודכנה בהצלחה!" + "{{enter}}" + "יש להיכנס מחדש.";
                        this.globalService.SocketEmit("LogoutUserSessionServer", updateMessage);
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
                    type: ALERT_TYPE.INFO,
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