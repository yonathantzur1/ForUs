import { Component, Input, OnInit } from '@angular/core';

import { UserEditWindowService } from '../../../services/userPage/userEditWindow/userEditWindow.service';
import { AlertService, AlertType } from '../../../services/alert/alert.service';

@Component({
    selector: 'userEditWindow',
    templateUrl: './userEditWindow.html',
    providers: [UserEditWindowService]
})

export class UserEditWindowComponent implements OnInit {
    @Input() user: any;
    editUser: any = {};

    constructor(private userEditWindowService: UserEditWindowService,
        private alertService: AlertService) { }

    ngOnInit() {
        this.editUser.firstName = this.user.firstName;
        this.editUser.lastName = this.user.lastName;
        this.editUser.email = this.user.email;
    }

    IsDisableSaveEdit() {
        if (!this.editUser.firstName || !this.editUser.lastName || !this.editUser.email) {
            return true;
        }
        else {
            return (this.editUser.firstName.trim() == this.user.firstName &&
                this.editUser.lastName.trim() == this.user.lastName &&
                this.editUser.email.trim() == this.user.email);
        }
    }

    SaveChanges() {
        if (!this.IsDisableSaveEdit()) {
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
                    this.alertService.Alert({
                        title: "עדכון מידע",
                        text: "העדכון בוצע בהצלחה",
                        type: AlertType.SUCCESS,
                        showCancelButton: false
                    });
                }
                else {
                    this.alertService.Alert({
                        title: "עדכון מידע",
                        text: "אופס...אירעה שגיאה בעדכון הפרטים",
                        type: AlertType.DANGER,
                        showCancelButton: false
                    });
                }
            });
        }
    }
}