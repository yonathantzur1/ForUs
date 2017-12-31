import { Component } from '@angular/core';

import { ManagementService } from '../../services/management/management.service';

@Component({
    selector: 'management',
    templateUrl: './management.html',
    providers: [ManagementService]
})

export class ManagementComponent {
    isLoadingUsers: boolean;
    searchInput: string;
    users: Array<any> = [];

    constructor(private managementService: ManagementService) { }

    SearchUser() {
        if (this.searchInput && (this.searchInput = this.searchInput.trim())) {
            this.isLoadingUsers = true;

            this.managementService.GetUserByName(this.searchInput).then((results: Array<any>) => {
                this.isLoadingUsers = false;

                if (results != null) {
                    this.users = results;

                    // Open user card in case only one result found.
                    (this.users.length == 1) && (this.users[0].isOpen = true);
                }
            });
        }
    }

    InputKeyup(event: any) {
        // In case of pressing ENTER.
        if (event.keyCode == 13) {
            this.SearchUser();
        }
    }

    ShowHideUserCard(user: any) {
        // In case the card is close.
        if (!user.isOpen) {
            user.isOpen = true;
        }
        else {
            user.isOpen = false;
        }
    }
}