import { Component, Input, HostListener } from '@angular/core';

import { UserPasswordWindowService } from '../../../services/userPage/userPasswordWindow.service';
import { AlertService, ALERT_TYPE } from '../../../services/global/alert.service';
import { SocketService } from '../../../services/global/socket.service';
import { EventService, EVENT_TYPE } from '../../../services/global/event.service';
import { MicrotextService, InputFieldValidation } from '../../../services/global/microtext.service';

import { USER_UPDATE_INFO_ERROR } from '../../../enums/enums'

export class Password {
    oldPassword: string = '';
    newPassword: string = '';
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

    constructor(private socketService: SocketService,
        private eventService: EventService,
        public alertService: AlertService,
        private microtextService: MicrotextService,
        private userPasswordWindowService: UserPasswordWindowService) {
        this.validationFuncs = [
            {
                isFieldValid(password: Password) {
                    return !!password.oldPassword;
                },
                errMsg: "יש להזין סיסמא נוכחית",
                fieldId: "old-password-micro",
                inputId: "oldPassword"
            },
            {
                isFieldValid(password: Password) {
                    return !!password.newPassword;
                },
                errMsg: "יש להזין סיסמא חדשה",
                fieldId: "new-password-micro",
                inputId: "newPassword"
            }
        ]
    }

    closeWindow() {
        this.eventService.emit(EVENT_TYPE.closeUserPasswordWindow);
    }

    // Hide microtext in a specific field.
    hideMicrotext(microtextId: string) {
        this.microtextService.hideMicrotext(microtextId);
    }

    @HostListener('document:keyup', ['$event'])
    KeyPress(event: any) {
        // In case of pressing escape.
        if (event.code == "Escape") {
            this.closeWindow();
        }
        else if (event.code == "Enter" || event.code == "NumpadEnter") {
            this.changePassword();
        }
    }

    changePassword() {
        if (this.microtextService.validation(this.validationFuncs, this.password)) {
            this.userPasswordWindowService.updateUserPassword(this.password).then(data => {
                if (data) {
                    let result = data.result;

                    if (result.lock) {
                        this.microtextService.showMicrotext("old-password-micro",
                            "העדכון ננעל למשך " + result.lock + " דקות");
                    }
                    else if (result == USER_UPDATE_INFO_ERROR.WRONG_PASSWORD) {
                        this.microtextService.showMicrotext("old-password-micro", "הסיסמא שהוזנה שגוייה");
                    }
                    else {
                        this.closeWindow();
                        let updateMessage = "הסיסמא עודכנה בהצלחה!" + "{{enter}}" + "יש להיכנס מחדש.";
                        this.socketService.socketEmit("LogoutUserSessionServer", updateMessage);
                    }
                }
                else {
                    this.changePasswordErrorAlert();
                }
            });
        }
    }

    changePasswordByMail() {
        this.userPasswordWindowService.changePasswordByMail().then(result => {
            this.closeWindow();

            if (result) {
                this.alertService.alert({
                    title: "שינוי סיסמא",
                    text: "יש להיכנס לקישור שנשלח לכתובת האימייל שלך.",
                    type: ALERT_TYPE.INFO,
                    showCancelButton: false
                });
            }
            else {
                this.changePasswordErrorAlert();
            }
        });
    }

    changePasswordErrorAlert() {
        this.alertService.alert({
            title: "שינוי סיסמא",
            text: "אופס... אירעה שגיאה בשינוי הסיסמא",
            type: ALERT_TYPE.DANGER,
            showCancelButton: false
        });
    }
}