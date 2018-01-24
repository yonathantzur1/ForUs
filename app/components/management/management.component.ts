import { Component } from '@angular/core';

import { ManagementService } from '../../services/management/management.service';
import { GlobalService } from '../../services/global/global.service';

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
    openCardAnimationTime: number = 200;

    constructor(private globalService: GlobalService, private managementService: ManagementService) { }

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
        // Open the card in case it is close.
        if (!user.isOpen) {
            user.isOpen = true;
            user.isOpenCardAnimationActive = true;

            setTimeout(function () {
                user.isOpenCardAnimationActive = false;
            }, this.openCardAnimationTime);
        }
        // Close the card in case it is open.
        else {
            user.isOpen = false;
            user.isFriendsScreenOpen = false;
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

    OpenFriendsScreen(user: any) {
        if (!user.friendsObjects) {
            this.managementService.GetUserFriends(user.friends).then((friends: any) => {
                friends && (user.friendsObjects = friends);
            });
        }

        user.isFriendsScreenOpen = true;
    }
}