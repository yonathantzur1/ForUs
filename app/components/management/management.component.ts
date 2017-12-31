import { Component } from '@angular/core';

import { ManagementService } from '../../services/management/management.service';

@Component({
    selector: 'management',
    templateUrl: './management.html',
    providers: [ManagementService]
})

export class ManagementComponent {
    isLoadingUsers: boolean;
    isPreventFirstOpenCardAnimation: boolean;
    searchInput: string;
    users: Array<any> = [];

    // Animation properties
    isOpenCardAnimationActive: boolean = false; 
    openCardAnimationTime: number = 200;

    constructor(private managementService: ManagementService) { }

    SearchUser() {
        if (this.searchInput && (this.searchInput = this.searchInput.trim())) {
            this.isLoadingUsers = true;

            this.managementService.GetUserByName(this.searchInput).then((results: Array<any>) => {
                this.isLoadingUsers = false;

                if (results != null) {
                    this.users = results;

                    // Open user card in case only one result found.
                    if (this.users.length == 1) {
                        this.users[0].isOpen = true;
                        this.isPreventFirstOpenCardAnimation = true;
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

    ShowHideUserCard(user: any) {
        // In case the card is close.
        if (!user.isOpen) {
            user.isOpen = true;
            this.isOpenCardAnimationActive = true;

            var self = this;

            setTimeout(function () {
                self.isOpenCardAnimationActive = false;
            }, this.openCardAnimationTime);
        }
        else {
            user.isOpen = false;
            this.isPreventFirstOpenCardAnimation = false;
        }
    }

    GetInfoDateString(date: string) {
        var dateObj = new Date(date);

        var dateString = (dateObj.getDate()) + "/" + (dateObj.getMonth() + 1) + "/" + dateObj.getFullYear();

        var HH = dateObj.getHours().toString();
        var mm = dateObj.getMinutes().toString();

        if (mm.length == 1) {
            mm = "0" + mm;
        }

        var timeString = (HH + ":" + mm);

        return (dateString + " - " + timeString);
    }
}