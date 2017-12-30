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
    user: any;

    constructor(private managementService: ManagementService) { }

    SearchUser() {
        if (this.searchInput && (this.searchInput = this.searchInput.trim())) {
            this.isLoadingUsers = true;

            this.managementService.GetUserByName(this.searchInput).then((results: Array<any>) => {
                this.isLoadingUsers = false;

                if (results != null) {
                    if (results.length == 1) {
                        this.user = results[0];
                    }
                    else {
                        this.users = results;
                    }
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
}