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
    friendsElementsPadding: number = 0;

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

    SearhUserInputKeyup(event: any) {
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
            user.friendSearchInput = null;
            user.isEditScreenOpen = false;
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

        if (!user.isFriendsObjectsLoaded) {
            var noneCachedFriendsIds = this.GetNoneCachedFriendsIds(user.friends);

            if (noneCachedFriendsIds.length > 0) {
                this.managementService.GetUserFriends(noneCachedFriendsIds).then((friends: any) => {
                    friends && friends.forEach((friend: any) => {
                        this.friendsCache[friend._id] = friend;
                    });

                    user.isFriendsObjectsLoaded = true;
                });
            }
            else {
                user.isFriendsObjectsLoaded = true;
            }
        }
    }

    ReturnMainCard(user: any) {
        user.isFriendsScreenOpen = false;
        user.friendSearchInput = null;
        user.isEditScreenOpen = false;
    }

    GetNoneCachedFriendsIds(friendsIds: Array<string>): Array<string> {
        var self = this;

        return friendsIds.filter(id => {
            return (self.friendsCache[id] == null);
        });
    }

    GetFriendsObjectsFromIds(friendsIds: Array<string>, friendSearchInput: string) {
        var self = this;

        var friends = friendsIds.map(id => {
            return self.friendsCache[id];
        });

        if (friendSearchInput && (friendSearchInput = friendSearchInput.trim())) {
            // Filter friends by the search field.
            return friends.filter(friend => {
                return (friend.fullName.indexOf(friendSearchInput) == 0 ||
                    friend.fullNameReversed.indexOf(friendSearchInput) == 0);
            });
        }
        else {
            return friends;
        }
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

        this.friendsElementsPadding = (freeWidthSpace / 2);

        return this.friendsElementsPadding;
    }

    IsDisableSaveEdit(user: any) {
        var editObj = user.editObj;

        return (editObj.firstName == user.firstName &&
            editObj.lastName == user.lastName &&
            editObj.email == user.email &&
            !editObj.password);
    }

    OpenEditScreen(user: any) {
        user.editObj = {}
        user.editObj.firstName = user.firstName;
        user.editObj.lastName = user.lastName;
        user.editObj.email = user.email;

        user.isEditScreenOpen = true;
    }

    SaveEdit(user: any) {
        if (!this.IsDisableSaveEdit(user)) {
            var editObj = user.editObj;
            var updateFields = { "_id": user._id };

            if (editObj.firstName != user.firstName) {
                updateFields["firstName"] = editObj.firstName;
            }

            if (editObj.lastName != user.lastName) {
                updateFields["lastName"] = editObj.lastName;
            }

            if (editObj.email != user.email) {
                updateFields["email"] = editObj.email;
            }

            if (editObj.password) {
                updateFields["password"] = editObj.password;
            }

            user.isEditLoader = true;

            // Update user info.
            this.managementService.EditUser(updateFields).then((result: boolean) => {
                user.isEditLoader = false;

                // In case the user info edit succeeded. 
                if (result) {
                    if (updateFields["password"]) {
                        delete updateFields["password"];
                        this.globalService.socket.emit("LogoutUserSessionServer", user._id);
                    }

                    Object.keys(updateFields).forEach(field => {
                        user[field] = updateFields[field];
                    });

                    this.ReturnMainCard(user);
                    $("#edit-user-success").snackbar("show");
                }
                else {
                    $("#edit-user-error").snackbar("show");
                }
            });
        }
    }
}