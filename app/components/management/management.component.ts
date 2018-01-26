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
    friendsCache: Object = {};

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

                    // Empty old result friends cache.
                    this.friendsCache = {};

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
        user.isFriendsScreenOpen = true;

        if (!user.friendsObjects) {
            var friendsObjectsOnCache: Array<any> = [];

            this.managementService.GetUserFriends(this.GetNoneCachedFriendsIds(user.friends, friendsObjectsOnCache)).then((friends: any) => {
                if (friends) {
                    friends.forEach((friend: any) => {
                        this.friendsCache[friend._id] = friend;
                    });

                    user.friendsObjects = friends.concat(friendsObjectsOnCache);
                }
            });
        }
    }

    CloseFriendsScreen(user: any) {
        user.isFriendsScreenOpen = false;
    }

    GetNoneCachedFriendsIds(friendsIds: Array<string>, friendsObjectsOnCache: Array<any>): Array<string> {
        var self = this;

        return friendsIds.filter(id => {
            if (self.friendsCache[id]) {
                friendsObjectsOnCache.push(self.friendsCache[id]);

                return false;
            }
            else {
                return true;
            }
        });
    }

    // Calculate align friends elements to center of screen.
    CalculateFriendsElementsPadding() {
        var friendElementSpace = 85 + 5 + 5; // width: 85 + margin (left and right): 5 + 5
        var containerWidth = $("#friends-container")[0].clientWidth;
        var maxElementsOnRow = friendElementSpace;

        var counter = 0;

        while (maxElementsOnRow < containerWidth) {
            counter++;
            maxElementsOnRow += friendElementSpace;
        }

        var freeWidthSpace = containerWidth - (counter * friendElementSpace);

        return (freeWidthSpace / 2);
    }
}