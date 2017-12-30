import { Component } from '@angular/core';

import { ManagementService } from '../../services/management/management.service';

class User {

}

@Component({
    selector: 'management',
    templateUrl: './management.html',
    providers: [ManagementService]
})

export class ManagementComponent {
    searchInput: string;
    Users: Array<User> = [];

    constructor(private managementService: ManagementService) { }

    SearchUser() {
        this.managementService.GetUserByName(this.searchInput).then((result: Array<User>) => {
            var x = result;
        });
    }
}