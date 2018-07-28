import { Component, Input, OnInit } from '@angular/core';

import { UserEditWindowService } from '../../../services/userPage/userEditWindow/userEditWindow.service';
import { AlertService, AlertType } from '../../../services/alert/alert.service';
import { GlobalService } from '../../../services/global/global.service';
import { MicrotextService, InputFieldValidation } from '../../../services/microtext/microtext.service';

import { UserRegexp } from '../../../regex/regexpEnums'

class EditUser {
    firstName?: string;
    lastName?: string;
    email?: string;
}

@Component({
    selector: 'userEditWindow',
    templateUrl: './userEditWindow.html',
    providers: [UserEditWindowService]
})

export class UserEditWindowComponent implements OnInit {
    @Input() user: any;
    editUser: EditUser = {};

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

    SaveChanges() {
        if (!this.IsDisableSaveEdit() &&
            this.microtextService.Validation(this.editValidationFuncs, this.editUser, UserRegexp)) {
            var updatedFields = {};

            if (this.editUser.firstName.trim() != this.user.firstName) {
                updatedFields["firstName"] = this.editUser.firstName;
            }

            if (this.editUser.lastName.trim() != this.user.lastName) {
                updatedFields["lastName"] = this.editUser.lastName;
            }

            if (this.editUser.email.trim() != this.user.email) {
                updatedFields["email"] = this.editUser.email;
            }

            this.userEditWindowService.UpdateUserInfo(updatedFields).then(result => {
                if (result) {
                    if (result == -1) {
                        this.microtextService.ShowMicrotext("edit-user-email-micro",
                            "כתובת אימייל זו כבר נמצאת בשימוש")
                    }
                    else {
                        this.globalService.setData("closeUserEditWindow", true);
                        this.alertService.Alert({
                            title: "עדכון מידע",
                            text: "העדכון בוצע בהצלחה",
                            type: AlertType.SUCCESS,
                            showCancelButton: false
                        });
                    }
                }
                else {
                    this.alertService.Alert({
                        title: "עדכון מידע",
                        text: "אופס... אירעה שגיאה בעדכון הפרטים",
                        type: AlertType.DANGER,
                        showCancelButton: false
                    });
                }
            });
        }
    }

    CloseWindow() {
        this.globalService.setData("closeUserEditWindow", true);
    }

    // Hide microtext in a specific field.
    HideMicrotext(microtextId: string) {
        this.microtextService.HideMicrotext(microtextId);
    }
}