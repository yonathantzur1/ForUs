import { Component, Input, OnInit } from '@angular/core';

import { UserEditWindowService } from '../../../services/userPage/userEditWindow/userEditWindow.service';
import { AlertService, ALERT_TYPE } from '../../../services/alert/alert.service';
import { GlobalService } from '../../../services/global/global.service';
import { MicrotextService, InputFieldValidation } from '../../../services/microtext/microtext.service';

import { USER_UPDATE_INFO_ERROR } from '../../../enums/enums'
import { UserRegexp } from '../../../regex/regexpEnums'

class EditUser {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
}

@Component({
    selector: 'userEditWindow',
    templateUrl: './userEditWindow.html',
    providers: [UserEditWindowService]
})

export class UserEditWindowComponent implements OnInit {
    @Input() user: any;
    editUser: EditUser = {};
    isShowPasswordValidationWindow: boolean = false;

    // Login validation functions array.
    editValidationFuncs: Array<InputFieldValidation> = [
        {
            isFieldValid(editUser: EditUser, userRegexp: any) {
                var namePattern = userRegexp.name;
                return (namePattern.test(editUser.firstName));
            },
            errMsg: "יש להזין שם תקין בעברית",
            fieldId: "edit-user-first-name-micro",
            inputId: "edit-first-name"
        },
        {
            isFieldValid(editUser: EditUser, userRegexp: any) {
                var namePattern = userRegexp.name;
                return (namePattern.test(editUser.lastName));
            },
            errMsg: "יש להזין שם תקין בעברית",
            fieldId: "edit-user-last-name-micro",
            inputId: "edit-last-name"
        },
        {
            isFieldValid(editUser: EditUser, userRegexp: any) {
                var emailPattern = userRegexp.email;
                return (emailPattern.test(editUser.email));
            },
            errMsg: "כתובת אימייל לא תקינה",
            fieldId: "edit-user-email-micro",
            inputId: "edit-email"
        }
    ]

    passwordValidationFuncs: Array<InputFieldValidation> = [
        {
            isFieldValid(editUser: EditUser) {
                return (editUser.password ? true : false);
            },
            errMsg: "יש להזין את סיסמת החשבון",
            fieldId: "edit-user-password-micro",
            inputId: "edit-password"
        },
    ]

    constructor(private userEditWindowService: UserEditWindowService,
        private alertService: AlertService,
        private globalService: GlobalService,
        private microtextService: MicrotextService) { }

    ngOnInit() {
        this.editUser.firstName = this.user.firstName;
        this.editUser.lastName = this.user.lastName;
        this.editUser.email = this.user.email;
    }

    IsDisableSaveEdit() {
        if (!this.editUser.firstName.trim() ||
            !this.editUser.lastName.trim() ||
            !this.editUser.email.trim()) {
            return true;
        }
        else {
            return (this.editUser.firstName.trim() == this.user.firstName &&
                this.editUser.lastName.trim() == this.user.lastName &&
                this.editUser.email.trim() == this.user.email);
        }
    }

    ShowValidatePasswordWindow() {
        if (!this.IsDisableSaveEdit() &&
            this.microtextService.Validation(this.editValidationFuncs, this.editUser, UserRegexp)) {
            this.isShowPasswordValidationWindow = true;
        }
    }

    BackToDetailsWindow() {
        this.isShowPasswordValidationWindow = false;
        this.editUser.password = "";
    }

    CloseWindow() {
        this.globalService.setData("closeUserEditWindow", true);
    }

    // Hide microtext in a specific field.
    HideMicrotext(microtextId: string) {
        this.microtextService.HideMicrotext(microtextId);
    }

    SaveChanges() {
        if (this.microtextService.Validation(this.passwordValidationFuncs, this.editUser)) {
            var updatedFields = {};

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

            this.userEditWindowService.UpdateUserInfo(updatedFields).then(result => {                
                if (result) {
                    if (result.lock) {
                        this.microtextService.ShowMicrotext("edit-user-password-micro",
                            "העדכון ננעל למשך " + result.lock + " דקות");
                    }
                    else if (result == USER_UPDATE_INFO_ERROR.EMAIL_EXISTS) {
                        this.BackToDetailsWindow();
                        this.microtextService.ShowMicrotext("edit-user-email-micro",
                            "כתובת אימייל זו כבר נמצאת בשימוש");
                    }
                    else if (result == USER_UPDATE_INFO_ERROR.WRONG_PASSWORD) {
                        this.microtextService.ShowMicrotext("edit-user-password-micro",
                            "הסיסמא שהוזנה שגוייה");
                    }
                    else {                        
                        this.CloseWindow();
                        this.globalService.socket.emit("LogoutUserSessionServer", this.user._id, "הפרטים התעדכנו בהצלחה!\nיש להיכנס מחדש.");
                    }
                }
                else {
                    this.alertService.Alert({
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