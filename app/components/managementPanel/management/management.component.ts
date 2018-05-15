import { Component, OnDestroy } from '@angular/core';

import { DropMenuData } from '../../../components/navbar/navbar.component';
import { ManagementService } from '../../../services/management/management.service';
import { GlobalService } from '../../../services/global/global.service';
import { AlertService } from '../../../services/alert/alert.service';

declare var $: any;
declare var snackbar: Function;

@Component({
    selector: 'management',
    templateUrl: './management.html',
    providers: [ManagementService]
})

export class ManagementComponent implements OnDestroy {

    isLoadingUsers: boolean;
    isPreventFirstOpenCardAnimation: boolean;
    searchInput: string;
    users: Array<any> = [];
    friendsCache: Object = {};
    friendsElementsPadding: number = 0;
    dropMenuDataList: Array<DropMenuData>;
    isShowNotFoundUsersMessage: boolean;

    // Animation properties    
    openCardAnimationTime: number = 200;

    subscribeObj: any;

    constructor(private globalService: GlobalService,
        private managementService: ManagementService,
        private alertService: AlertService) {

        this.subscribeObj = this.globalService.data.subscribe((value: any) => {
            if (value["closeDropMenu"]) {
                this.CloseAllUsersMenu();
            }
        });

        document.body.addEventListener("click", this.clickFunction.bind(this));

        var self = this;

        self.dropMenuDataList = [
            new DropMenuData(null, "עריכה", () => {
                var user = self.GetUserWithOpenMenu();
                user.editObj = {}
                user.editObj.firstName = user.firstName;
                user.editObj.lastName = user.lastName;
                user.editObj.email = user.email;

                user.isEditScreenOpen = true;
            }),
            new DropMenuData(null, "חסימה", () => {
                var user = self.GetUserWithOpenMenu();

                user.blockAmount = {
                    days: 0,
                    weeks: 0,
                    months: 0,
                    forever: false
                };

                user.isBlockScreenOpen = true;
            }, () => {
                var user = self.GetUserWithOpenMenu();

                // Show only if the user is not already blocked.
                if (!user) {
                    return true;
                }
                else {
                    return (self.IsUserBlocked(user) == false);
                }
            }),
            new DropMenuData(null, "ביטול חסימה", () => {
                var user = self.GetUserWithOpenMenu();
                self.UnblockUser(user);
            }, () => {
                var user = self.GetUserWithOpenMenu();

                // Show only if the user is not already blocked.
                if (!user) {
                    return false;
                }
                else {
                    return (self.IsUserBlocked(user) == true);
                }
            }),
            new DropMenuData(null, "הרשאות", () => {
                self.globalService.setData("isOpenPermissionsCard", self.GetUserWithOpenMenu());
            }, () => {
                return (self.globalService.IsUserHasMasterPermission());
            }),
            new DropMenuData(null, "מחיקת משתמש", () => {
                var user = self.GetUserWithOpenMenu();
                self.DeleteUser(user);
            }, () => {
                return (self.globalService.IsUserHasMasterPermission());
            })
        ];
    }

    ngOnDestroy() {
        this.subscribeObj.unsubscribe();
        document.body.removeEventListener("click", this.clickFunction);
    }

    SearchUser() {
        if (this.searchInput && (this.searchInput = this.searchInput.trim())) {
            this.isLoadingUsers = true;

            this.managementService.GetUserByName(this.searchInput).then((results: Array<any>) => {
                this.isLoadingUsers = false;

                if (results && results.length > 0) {
                    this.isShowNotFoundUsersMessage = false;
                    this.users = results;

                    // Empty old result friends cache.
                    this.friendsCache = {};

                    // Open user card in case only one result found.
                    if (this.users.length == 1) {
                        this.users[0].isOpen = true;
                        this.isPreventFirstOpenCardAnimation = true;
                    }
                }
                else {
                    this.users = [];
                    this.isShowNotFoundUsersMessage = true;
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

    ReturnMainCard(user: any) {
        user.friendSearchInput = null;
        user.isFriendsScreenOpen = false;
        user.isEditScreenOpen = false;
        user.blockReason = null;
        user.isBlockScreenOpen = false;
    }

    ShowHideUserCard(user: any) {
        this.CloseAllUsersMenu();

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
            this.isPreventFirstOpenCardAnimation = false;
            this.ReturnMainCard(user);
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
        // In case the user has friends.
        if (user.friendsNumber > 0) {
            user.isMenuOpen = false;
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

    IsDisableSaveBlocking(user: any) {
        var blockAmount = user.blockAmount;

        return (!user.blockReason ||
            (blockAmount.forever == false &&
                ((blockAmount.days == null || blockAmount.weeks == null || blockAmount.months == null) ||
                    (blockAmount.days == 0 && blockAmount.weeks == 0 && blockAmount.months == 0) ||
                    (blockAmount.days < 0 || blockAmount.weeks < 0 || blockAmount.months < 0))));
    }

    OpenUserMenu(user: any) {
        var isOpen = !user.isMenuOpen;
        this.CloseAllUsersMenu();
        user.isMenuOpen = isOpen;
    }

    CloseUserMenu(user: any) {
        user.isMenuOpen = false;
    }

    SaveChanges(user: any) {
        if (user.isEditScreenOpen && !this.IsDisableSaveEdit(user)) {
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

            user.isSaveLoader = true;

            // Update user info.
            this.managementService.EditUser(updateFields).then((result: any) => {
                user.isSaveLoader = false;

                // In case the user info edit succeeded. 
                if (result) {
                    if (updateFields["password"]) {
                        delete updateFields["password"];
                        this.globalService.socket.emit("LogoutUserSessionServer",
                            user._id,
                            "נותקת מהאתר, יש להתחבר מחדש");
                    }

                    Object.keys(updateFields).forEach(field => {
                        user[field] = updateFields[field];
                    });

                    this.ReturnMainCard(user);
                    snackbar("המשתמש עודכן בהצלחה");
                }
                else {
                    snackbar("שגיאה בעדכון המשתמש");
                }
            });
        }
        else if (user.isBlockScreenOpen && !this.IsDisableSaveBlocking(user)) {
            var blockObj = {
                "_id": user._id,
                "blockReason": user.blockReason,
                "blockAmount": user.blockAmount
            }

            user.isSaveLoader = true;

            this.managementService.BlockUser(blockObj).then((result: any) => {
                user.isSaveLoader = false;

                if (result) {
                    user.block = result;
                    this.ReturnMainCard(user);
                    snackbar("חסימת המשתמש בוצעה בהצלחה");

                    var blockUserMsg = "חשבון זה נחסם" + "\n\n" +
                        "<b>סיבה: </b>" + user.block.reason + "\n" +
                        "<b>עד תאריך: </b>" +
                        (user.block.unblockDate ? this.ConvertDateFormat(user.block.unblockDate) : "בלתי מוגבל");

                    this.globalService.socket.emit("LogoutUserSessionServer",
                        user._id,
                        blockUserMsg);
                }
                else {
                    snackbar("שגיאה בחסימת המשתמש");
                }
            });
        }
    }

    UnblockUser(user: any) {
        this.CloseAllUsersMenu();
        var self = this;

        self.alertService.Alert({
            title: "ביטול חסימה - " + user.firstName + " " + user.lastName,
            text: "האם לבטל את החסימה?" + "\n\n" +
                "<b>סיבה - </b>" + user.block.reason + "\n" +
                "<b>עד תאריך - </b>" + (user.block.unblockDate ? self.ConvertDateFormat(user.block.unblockDate) : "בלתי מוגבל"),
            type: "info",
            confirmFunc: function () {
                self.managementService.UnblockUser(user._id).then((result: any) => {
                    if (result) {
                        delete user.block;
                        snackbar("ביטול החסימה בוצע בהצלחה");
                    }
                    else {
                        snackbar("שגיאה בביטול חסימת המשתמש");
                    }
                });
            }
        });
    }

    IsUserBlocked(user: any) {
        if (user.block &&
            (!user.block.unblockDate || new Date(user.block.unblockDate).getTime() > Date.now())) {
            return true;
        }
        else {
            return false;
        }
    }

    GetUserWithOpenMenu() {
        for (var i = 0; i < this.users.length; i++) {
            if (this.users[i].isMenuOpen) {
                this.users[i].index = i;
                return this.users[i];
            }
        }

        return null;
    }

    CloseAllUsersMenu() {
        this.users.forEach(user => {
            user.isMenuOpen = false;
        });
    }

    ConvertDateFormat(date: Date) {
        date = new Date(date);
        return (date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear());
    }

    RemoveFriends(user: any, friend: any) {
        var self = this;

        self.alertService.Alert({
            title: "הסרת חברות",
            text: "האם למחוק את החברות בין " + "<b>" + user.firstName + " " + user.lastName + "</b>\n" +
                "לבין " + "<b>" + friend.fullName + "</b>?",
            type: "warning",
            confirmFunc: function () {
                self.managementService.RemoveFriends(user._id, friend._id).then((result: any) => {
                    if (result) {
                        var index = null;

                        for (var i = 0; i < user.friends.length; i++) {
                            if (user.friends[i] == friend._id) {
                                index = i;
                                break;
                            }
                        }

                        if (index != null) {
                            user.friends.splice(index, 1);
                            snackbar("מחיקת החברות בוצעה בהצלחה");
                        }

                        var logoutMsg = "נותקת מהאתר, יש להתחבר מחדש.";
                        self.globalService.socket.emit("LogoutUserSessionServer", user._id, logoutMsg);
                        self.globalService.socket.emit("LogoutUserSessionServer", friend._id, logoutMsg);
                    }
                    else {
                        snackbar("שגיאה במחיקת החברות");
                    }
                });
            }
        });
    }

    DeleteUser(user: any) {
        var self = this;

        self.alertService.Alert({
            title: "מחיקת משתמש",
            text: "האם למחוק את המשתמש של <b>" + user.firstName + " " + user.lastName + "</b>?",
            type: "warning",
            confirmFunc: function () {
                self.managementService.DeleteUser(user._id).then((result: any) => {
                    if (result) {
                        snackbar("מחיקת המשתמש בוצעה בהצלחה");

                        // Logout the user from the system.
                        var logoutMsg = "חשבונך נמחק מהמערכת לצמיתות. \nלפרטים נוספים, פנה להנהלת האתר.";
                        self.globalService.socket.emit("LogoutUserSessionServer", user._id, logoutMsg);

                        // Remove user from users search list.
                        self.users.splice(user.index, 1);

                        // Remove all instances of the user from his friends.
                        self.globalService.socket.emit("ServerRemoveFriendUser", user._id,
                            user.firstName + " " + user.lastName,
                            result);
                    }
                    else {
                        snackbar("שגיאה במחיקת המשתמש");
                    }
                })
            }
        });
    }

    clickFunction(e: any) {
        var userWithOpenMenu = this.GetUserWithOpenMenu();
        var isMenuClick;

        if (userWithOpenMenu) {
            isMenuClick = false;

            for (var i = 0; i < e.path.length; i++) {
                if (e.path[i].id == "user-options" || e.path[i].id == "user-settings-icon") {
                    isMenuClick = true;
                    break;
                }
            }

            if (!isMenuClick) {
                this.CloseUserMenu(userWithOpenMenu);
            }
        }
    }
}