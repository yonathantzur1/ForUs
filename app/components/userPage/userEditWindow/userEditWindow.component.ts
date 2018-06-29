import { Component, Input, OnInit } from '@angular/core';

import { UserEditWindowService } from '../../../services/userPage/userEditWindow/userEditWindow.service';

@Component({
    selector: 'userEditWindow',
    templateUrl: './userEditWindow.html',
    providers: [UserEditWindowService]
})

export class UserEditWindowComponent implements OnInit {
    @Input() user: any;
    editUser: any = {};

    constructor(userEditWindowService: UserEditWindowService) { }

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
            
        }
    }
}