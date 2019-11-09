import { Component, Input, OnInit, HostListener } from '@angular/core';

import { UserEditWindowService } from '../../../services/userPage/userEditWindow.service';
import { AlertService, ALERT_TYPE } from '../../../services/global/alert.service';
import { SocketService } from '../../../services/global/socket.service';
import { EventService, EVENT_TYPE } from '../../../services/global/event.service';
import { MicrotextService, InputFieldValidation } from '../../../services/global/microtext.service';

import { USER_UPDATE_INFO_ERROR } from '../../../enums/enums'
import { UserRegexp } from '../../../regex/regexpEnums'

class editUser {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
}

@Component({
    selector: 'userEditWindow',
    templateUrl: './userEditWindow.html',
    providers: [UserEditWindowService],
    styleUrls: ['./userEditWindow.css', '../userWindow.css']
})

export class UserEditWindowComponent implements OnInit {
    editValidationFuncs: Array<InputFieldValidation>;
    passwordValidationFuncs: Array<InputFieldValidation>;

    @Input() user: any;
    editUser: editUser = {};
    isShowPasswordValidationWindow: boolean = false;

    constructor(private userEditWindowService: UserEditWindowService,
        private alertService: AlertService,
        private socketService: SocketService,
        private eventService: EventService,
        private microtextService: MicrotextService) {
        this.editValidationFuncs = [
            {
                isFieldValid(editUser: editUser, userRegexp: any) {
                    let namePattern = userRegexp.name;
                    return (namePattern.test(editUser.firstName));
                },
                errMsg: "יש להזין שם תקין בעברית",
                fieldId: "edit-user-first-name-micro",
                inputId: "edit-first-name"
            },
            {
                isFieldValid(editUser: editUser, userRegexp: any) {
                    let namePattern = userRegexp.name;
                    return (namePattern.test(editUser.lastName));
                },
                errMsg: "יש להזין שם תקין בעברית",
                fieldId: "edit-user-last-name-micro",
                inputId: "edit-last-name"
            },
            {
                isFieldValid(editUser: editUser, userRegexp: any) {
                    let emailPattern = userRegexp.email;
                    return (emailPattern.test(editUser.email));
                },
                errMsg: "כתובת אימייל לא תקינה",
                fieldId: "edit-user-email-micro",
                inputId: "edit-email"
            }
        ];

        this.passwordValidationFuncs = [
            {
                isFieldValid(editUser: editUser) {
                    return !!editUser.password;
                },
                errMsg: "יש להזין את סיסמת החשבון",
                fieldId: "edit-user-password-micro",
                inputId: "edit-password"
            },
        ];
    }

    ngOnInit() {
        this.editUser.firstName = this.user.firstName;
        this.editUser.lastName = this.user.lastName;
        this.editUser.email = this.user.email;
    }

    isDisableSaveEdit() {
        if (!this.editUser.firstName.trim() ||
            !this.editUser.lastName.trim() ||
            !this.editUser.email.trim()) {
            return true;
        }
        else {
            return (this.editUser.firstName.trim() == this.user.firstName &&
                this.editUser.lastName.trim() == this.user.lastName &&
                this.editUser.email.trim().toLowerCase() == this.user.email.toLowerCase());
        }
    }

    showValidatePasswordWindow() {
        if (!this.isDisableSaveEdit() &&
            this.microtextService.validation(this.editValidationFuncs, this.editUser, UserRegexp)) {
            this.isShowPasswordValidationWindow = true;
        }
    }

    backToDetailsWindow() {
        this.isShowPasswordValidationWindow = false;
        this.editUser.password = '';
    }

    closeWindow() {
        this.eventService.emit(EVENT_TYPE.closeUserEditWindow, true);
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
            if (!this.isShowPasswordValidationWindow) {
                this.showValidatePasswordWindow()
            }
            else {
                this.saveChanges();
            }
        }
    }

    saveChanges() {
        if (this.microtextService.validation(this.passwordValidationFuncs, this.editUser)) {
            let updatedFields = {};

            updatedFields["password"] = this.editUser.password;
            delete this.editUser.password;

            // Trim all editUser properties.
            Object.keys(this.editUser).forEach(key => {
                // Trim the field in case it is string.
                if (typeof this.editUser[key] == "string") {
                    this.editUser[key] = this.editUser[key].trim();
                }

                // In case the new field is not equal to the old one.
                if (this.editUser[key] != this.user[key]) {
                    // Put the field on update object to send the server.
                    updatedFields[key] = this.editUser[key];
                }
            });

            this.userEditWindowService.updateUserInfo(updatedFields).then(data => {
                if (data) {
                    let result = data.result;

                    if (result.lock) {
                        this.microtextService.showMicrotext("edit-user-password-micro",
                            "העדכון ננעל למשך " + result.lock + " דקות");
                    }
                    else if (result == USER_UPDATE_INFO_ERROR.EMAIL_EXISTS) {
                        this.backToDetailsWindow();
                        this.microtextService.showMicrotext("edit-user-email-micro",
                            "כתובת אימייל זו כבר נמצאת בשימוש");
                    }
                    else if (result == USER_UPDATE_INFO_ERROR.WRONG_PASSWORD) {
                        this.microtextService.showMicrotext("edit-user-password-micro",
                            "הסיסמא שהוזנה שגוייה");
                    }
                    else {
                        this.closeWindow();
                        let updateMessage = "הפרטים עודכנו בהצלחה!" + "{{enter}}" + "יש להיכנס מחדש.";
                        this.socketService.socketEmit("LogoutUserSessionServer", updateMessage);
                    }
                }
                else {
                    this.alertService.alert({
                        title: "עדכון מידע",
                        text: "אופס... אירעה שגיאה בעדכון הפרטים",
                        type: ALERT_TYPE.DANGER,
                        showCancelButton: false
                    });
                }
            });
        }
    }
}