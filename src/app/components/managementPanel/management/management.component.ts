import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { DropMenuData } from '../../navbar/navbar.component';
import { ManagementService } from '../../../services/managementPanel/management/management.service';
import { GlobalService } from '../../../services/global/global.service';
import { EventService } from '../../../services/event/event.service';
import { AlertService, ALERT_TYPE } from '../../../services/alert/alert.service';
import { SnackbarService } from '../../../services/snackbar/snackbar.service';

import { PERMISSION } from '../../../enums/enums'

@Component({
    selector: 'management',
    templateUrl: './management.html',
    providers: [ManagementService],
    styleUrls: ['./management.css']
})

export class ManagementComponent implements OnInit, OnDestroy {
    isLoadingUsers: boolean;
    isPreventFirstOpenCardAnimation: boolean;
    searchInput: string;
    users: Array<any> = [];
    friendsCache: Object = {};
    dropMenuDataList: Array<DropMenuData>;
    isShowNotFoundUsersMessage: boolean;
    userSettingsIconId: string = "user-settings-icon";

    // Animation properties    
    openCardAnimationTime: number = 200;

    eventsIds: Array<string> = [];

    constructor(private router: Router,
        private route: ActivatedRoute,
        public globalService: GlobalService,
        private eventService: EventService,
        private managementService: ManagementService,
        public alertService: AlertService,
        public snackbarService: SnackbarService) {

        let self = this;

        //#region events
        eventService.Register("closeDropMenu", () => {
            self.CloseAllUsersMenu();
        }, self.eventsIds);
        //#endregion

        self.dropMenuDataList = [
            new DropMenuData(null, "עריכה", () => {
                let user = self.GetUserWithOpenMenu();
                user.editObj = {}
                user.editObj.firstName = user.firstName;
                user.editObj.lastName = user.lastName;
                user.editObj.email = user.email;

                user.isEditScreenOpen = true;
            }),
            new DropMenuData(null, "חסימה", () => {
                let user = self.GetUserWithOpenMenu();

                user.blockAmount = {
                    days: 0,
                    weeks: 0,
                    months: 0,
                    forever: false
                };

                user.isBlockScreenOpen = true;
            }, () => {
                let user = self.GetUserWithOpenMenu();

                // Show only if the user is not already blocked.
                if (!user) {
                    return true;
                }
                else {
                    return self.IsUserBlocked(user) == false;
                }
            }),
            new DropMenuData(null, "ביטול חסימה", () => {
                let user = self.GetUserWithOpenMenu();
                self.UnblockUser(user);
            }, () => {
                let user = self.GetUserWithOpenMenu();

                // Show only if the user is not already blocked.
                if (!user) {
                    return false;
                }
                else {
                    return (self.IsUserBlocked(user) == true);
                }
            }),
            new DropMenuData(null, "הרשאות", () => {
                self.eventService.Emit("openPermissionsCard", self.GetUserWithOpenMenu());
            }, () => {
                return (self.globalService.IsUserHasMasterPermission());
            }),
            new DropMenuData(null, "מחיקת משתמש", () => {
                let user = self.GetUserWithOpenMenu();
                self.DeleteUser(user);
            }, () => {
                return (self.globalService.IsUserHasMasterPermission());
            })
        ];
    }

    ngOnInit() {
        // In case of route params changed.
        this.route.params.subscribe(params => {
            if (params["id"]) {
                this.SearchUser(params["id"]);
            }
        });
    }

    ngOnDestroy() {
        this.eventService.UnsubscribeEvents(this.eventsIds);
    }

    IsShowUserSettingsBtn(user) {
        return user.permissions.indexOf(PERMISSION.MASTER) == -1 &&
            this.globalService.userId != user._id &&
            user.isOpen &&
            !user.isOpenCardAnimationActive &&
            !user.isFriendsScreenOpen &&
            !user.isEditScreenOpen &&
            !user.isBlockScreenOpen;
    }

    IsShowRemoveFriendBtn(user) {
        return user._id == this.globalService.userId ||
            user.permissions.indexOf(PERMISSION.MASTER) == -1;
    }

    IsDisableRemoveFriendBtn(friend) {
        return friend._id != this.globalService.userId &&
            friend.permissions.indexOf(PERMISSION.MASTER) != -1;
    }

    SearchUser(userId?: string) {
        if (userId || (this.searchInput && (this.searchInput = this.searchInput.trim()))) {
            this.isLoadingUsers = true;

            this.managementService.GetUserByName(userId || this.searchInput).then((results: Array<any>) => {
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
        if (event.key == "Enter" || event.key == "NumpadEnter") {
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
        let dateObj = new Date(date);

        let dateString = (dateObj.getDate()) + "/" + (dateObj.getMonth() + 1) + "/" + dateObj.getFullYear();

        let HH = dateObj.getHours().toString();
        let mm = dateObj.getMinutes().toString();

        if (mm.length == 1) {
            mm = "0" + mm;
        }

        let timeString = (HH + ":" + mm);

        return (dateString + " - " + timeString);
    }

    OpenFriendsScreen(user: any) {
        // In case the user has friends.
        if (user.friendsAmount > 0) {
            user.isMenuOpen = false;
            user.isFriendsScreenOpen = true;

            if (!user.isFriendsObjectsLoaded) {
                let noneCachedFriendsIds = this.GetNoneCachedFriendsIds(user.friends);

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
        let self = this;

        return friendsIds.filter(id => {
            return (self.friendsCache[id] == null);
        });
    }

    GetFriendsObjectsFromIds(friendsIds: Array<string>, friendSearchInput: string) {
        let self = this;

        let friends = friendsIds.map(id => {
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

    IsDisableSaveEdit(user: any) {
        let editObj = user.editObj;

        if (!editObj.firstName || !editObj.lastName || !editObj.email) {
            return true;
        }
        else {
            return (editObj.firstName.trim() == user.firstName &&
                editObj.lastName.trim() == user.lastName &&
                editObj.email.trim() == user.email &&
                !editObj.password);
        }
    }

    IsDisableSaveBlocking(user: any) {
        let blockAmount = user.blockAmount;

        return (!user.blockReason ||
            (blockAmount.forever == false &&
                ((blockAmount.days == null || blockAmount.weeks == null || blockAmount.months == null) ||
                    (blockAmount.days == 0 && blockAmount.weeks == 0 && blockAmount.months == 0) ||
                    (blockAmount.days < 0 || blockAmount.weeks < 0 || blockAmount.months < 0))));
    }

    OpenUserMenu(user: any) {
        let isOpen = !user.isMenuOpen;
        this.CloseAllUsersMenu();
        user.isMenuOpen = isOpen;
    }

    CloseUserMenu(user: any) {
        user.isMenuOpen = false;
    }

    SaveChanges(user: any) {
        if (user.isEditScreenOpen && !this.IsDisableSaveEdit(user)) {
            let editObj = user.editObj;
            let updatedFields = { "_id": user._id };

            if (editObj.firstName.trim() != user.firstName) {
                updatedFields["firstName"] = editObj.firstName.trim();
            }

            if (editObj.lastName.trim() != user.lastName) {
                updatedFields["lastName"] = editObj.lastName.trim();
            }

            if (editObj.email.trim() != user.email) {
                updatedFields["email"] = editObj.email.trim();
            }

            if (editObj.password) {
                updatedFields["password"] = editObj.password.trim();
            }

            user.isSaveLoader = true;

            // Update user info.
            this.managementService.EditUser(updatedFields).then((result: any) => {
                user.isSaveLoader = false;

                // In case the user info edit succeeded. 
                if (result) {
                    if (updatedFields["password"]) {
                        delete updatedFields["password"];
                        this.globalService.SocketEmit("LogoutUserSessionServer",
                            user._id,
                            "נותקת מהאתר, יש להתחבר מחדש");
                    }

                    Object.keys(updatedFields).forEach(field => {
                        user[field] = updatedFields[field];
                    });

                    this.ReturnMainCard(user);
                    this.snackbarService.Snackbar("המשתמש עודכן בהצלחה");
                }
                else {
                    this.snackbarService.Snackbar("שגיאה בעדכון המשתמש");
                }
            });
        }
        else if (user.isBlockScreenOpen && !this.IsDisableSaveBlocking(user)) {
            let blockObj = {
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
                    this.snackbarService.Snackbar("חסימת המשתמש בוצעה בהצלחה");

                    let blockUserMsg = "חשבון זה נחסם" +
                        "{{enter}}" + "{{enter}}" +
                        "<b>סיבה: </b>" + user.block.reason +
                        "{{enter}}" +
                        "<b>עד תאריך: </b>" +
                        (user.block.unblockDate ? this.FormatDate(user.block.unblockDate) : "בלתי מוגבל");

                    this.globalService.SocketEmit("LogoutUserSessionServer",
                        user._id,
                        blockUserMsg);
                }
                else {
                    this.snackbarService.Snackbar("שגיאה בחסימת המשתמש");
                }
            });
        }
    }

    UnblockUser(user: any) {
        this.CloseAllUsersMenu();
        let self = this;

        self.alertService.Alert({
            title: "ביטול חסימה - " + user.firstName + " " + user.lastName,
            text: "האם לבטל את החסימה?" + "\n\n" +
                "<b>סיבה - </b>" + user.block.reason + "\n" +
                "<b>עד תאריך - </b>" + (user.block.unblockDate ? self.FormatDate(user.block.unblockDate) : "בלתי מוגבל"),
            type: ALERT_TYPE.INFO,
            confirmFunc: function () {
                self.managementService.UnblockUser(user._id).then((result: any) => {
                    if (result) {
                        delete user.block;
                        self.snackbarService.Snackbar("ביטול החסימה בוצע בהצלחה");
                    }
                    else {
                        self.snackbarService.Snackbar("שגיאה בביטול חסימת המשתמש");
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
        for (let i = 0; i < this.users.length; i++) {
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

    FormatDate(date: Date) {
        date = new Date(date);
        return (date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear());
    }

    RemoveFriends(user: any, friend: any) {
        if (this.IsDisableRemoveFriendBtn(friend)) {
            return;
        }

        let self = this;

        self.alertService.Alert({
            title: "הסרת חברות",
            text: "האם למחוק את החברות בין " + "<b>" + user.firstName + " " + user.lastName + "</b>\n" +
                "לבין " + "<b>" + friend.fullName + "</b>?",
            type: ALERT_TYPE.WARNING,
            confirmFunc: function () {
                self.managementService.RemoveFriends(user._id, friend._id).then((result: any) => {
                    if (result) {
                        let index = null;

                        for (let i = 0; i < user.friends.length; i++) {
                            if (user.friends[i] == friend._id) {
                                index = i;
                                break;
                            }
                        }

                        if (index != null) {
                            user.friends.splice(index, 1);
                            self.snackbarService.Snackbar("מחיקת החברות בוצעה בהצלחה");
                        }

                        let logoutMsg = "נותקת מהאתר, יש להתחבר מחדש.";
                        self.globalService.SocketEmit("LogoutUserSessionServer", user._id, logoutMsg);
                        self.globalService.SocketEmit("LogoutUserSessionServer", friend._id, logoutMsg);
                    }
                    else {
                        self.snackbarService.Snackbar("שגיאה במחיקת החברות");
                    }
                });
            }
        });
    }

    DeleteUser(user: any) {
        let self = this;

        self.alertService.Alert({
            title: "מחיקת משתמש",
            text: "האם למחוק את המשתמש של <b>" + user.firstName + " " + user.lastName + "</b>?",
            type: ALERT_TYPE.WARNING,
            confirmFunc: function () {
                self.managementService.DeleteUser(user._id, user.firstName, user.lastName).then((result: any) => {
                    if (result) {
                        self.snackbarService.Snackbar("מחיקת המשתמש בוצעה בהצלחה");

                        // Logout the user from the system.
                        let logoutMsg = "חשבונך נמחק מהמערכת לצמיתות." +
                            "{{enter}}" +
                            "לפרטים נוספים, פנה להנהלת האתר.";
                        self.globalService.SocketEmit("LogoutUserSessionServer", user._id, logoutMsg);

                        // Remove user from users search list.
                        self.users.splice(user.index, 1);
                    }
                    else {
                        self.snackbarService.Snackbar("שגיאה במחיקת המשתמש");
                    }
                })
            }
        });
    }

    @HostListener('document:click', ['$event'])
    ComponentClick(event: any) {
        let userWithOpenMenu = this.GetUserWithOpenMenu();
        let isMenuClick;

        if (userWithOpenMenu) {
            isMenuClick = false;

            for (let i = 0; i < event.path.length; i++) {
                if (event.path[i].id == this.userSettingsIconId) {
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