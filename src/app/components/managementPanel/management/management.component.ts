import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { DropMenuData } from '../../dropMenu/dropMenu.component';
import { ManagementService } from '../../../services/managementPanel/management/management.service';
import { GlobalService } from '../../../services/global/global.service';
import { PermissionsService } from '../../../services/global/permissions.service';
import { SocketService } from '../../../services/global/socket.service';
import { EventService, EVENT_TYPE } from '../../../services/global/event.service';
import { AlertService, ALERT_TYPE } from '../../../services/global/alert.service';
import { SnackbarService } from '../../../services/global/snackbar.service';

import { PERMISSION } from '../../../enums/enums'
import { ImageService } from 'src/app/services/global/image.service';

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

    constructor(private route: ActivatedRoute,
        private globalService: GlobalService,
        private socketService: SocketService,
        public imageService: ImageService,
        public permissionsService: PermissionsService,
        private eventService: EventService,
        private managementService: ManagementService,
        public alertService: AlertService,
        public snackbarService: SnackbarService) {

        let self = this;

        //#region events

        eventService.register(EVENT_TYPE.closeDropMenu, () => {
            self.closeAllUsersMenu();
        }, self.eventsIds);

        //#endregion

        self.dropMenuDataList = [
            new DropMenuData(null, "עריכה", () => {
                let user = self.getUserWithOpenMenu();
                user.editObj = {}
                user.editObj.firstName = user.firstName;
                user.editObj.lastName = user.lastName;
                user.editObj.email = user.email;

                user.isEditScreenOpen = true;
            }),
            new DropMenuData(null, "חסימה", () => {
                let user = self.getUserWithOpenMenu();

                user.blockAmount = {
                    days: 0,
                    weeks: 0,
                    months: 0,
                    forever: false
                };

                user.isBlockScreenOpen = true;
            }, () => {
                let user = self.getUserWithOpenMenu();

                // Show only if the user is not already blocked.
                if (!user) {
                    return true;
                }
                else {
                    return self.isUserBlocked(user) == false;
                }
            }),
            new DropMenuData(null, "ביטול חסימה", () => {
                let user = self.getUserWithOpenMenu();
                self.unblockUser(user);
            }, () => {
                let user = self.getUserWithOpenMenu();

                // Show only if the user is not already blocked.
                if (!user) {
                    return false;
                }
                else {
                    return (self.isUserBlocked(user) == true);
                }
            }),
            new DropMenuData(null, "הרשאות", () => {
                self.eventService.Emit(EVENT_TYPE.openPermissionsCard, self.getUserWithOpenMenu());
            }, () => {
                return (self.permissionsService.IsUserHasMasterPermission());
            }),
            new DropMenuData(null, "מחיקת משתמש", () => {
                let user = self.getUserWithOpenMenu();
                self.deleteUser(user);
            }, () => {
                return (self.permissionsService.IsUserHasMasterPermission());
            })
        ];
    }

    ngOnInit() {
        // In case of route params changed.
        this.route.params.subscribe(params => {
            if (params["id"]) {
                this.searchUser(params["id"]);
            }
        });
    }

    ngOnDestroy() {
        this.eventService.UnsubscribeEvents(this.eventsIds);
    }

    isShowUserSettingsBtn(user) {
        return !user.permissions.includes(PERMISSION.MASTER) &&
            this.globalService.userId != user._id &&
            user.isOpen &&
            !user.isOpenCardAnimationActive &&
            !user.isFriendsScreenOpen &&
            !user.isEditScreenOpen &&
            !user.isBlockScreenOpen;
    }

    isShowRemoveFriendBtn(user) {
        return user._id == this.globalService.userId ||
            !user.permissions.includes(PERMISSION.MASTER);
    }

    isDisableRemoveFriendBtn(friend) {
        return friend._id != this.globalService.userId &&
            friend.permissions.includes(PERMISSION.MASTER);
    }

    searchUser(userId?: string) {
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

    searhUserInputKeyup(event: any) {
        // In case of pressing ENTER.
        if (event.key == "Enter" || event.key == "NumpadEnter") {
            this.searchUser();
        }
    }

    returnMainCard(user: any) {
        user.friendSearchInput = null;
        user.isFriendsScreenOpen = false;
        user.isEditScreenOpen = false;
        user.blockReason = null;
        user.isBlockScreenOpen = false;
    }

    showHideUserCard(user: any) {
        this.closeAllUsersMenu();

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
            this.returnMainCard(user);
        }
    }

    getInfoDateString(date: string) {
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

    openFriendsScreen(user: any) {
        // In case the user has friends.
        if (user.friendsAmount > 0) {
            user.isMenuOpen = false;
            user.isFriendsScreenOpen = true;

            if (!user.isFriendsObjectsLoaded) {
                let noneCachedFriendsIds = this.getNoneCachedFriendsIds(user.friends);

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

    getNoneCachedFriendsIds(friendsIds: Array<string>): Array<string> {
        let self = this;

        return friendsIds.filter(id => {
            return (self.friendsCache[id] == null);
        });
    }

    getFriendsObjectsFromIds(friendsIds: Array<string>, friendSearchInput: string) {
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

    isDisableSaveEdit(user: any) {
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

    isDisableSaveBlocking(user: any) {
        let blockAmount = user.blockAmount;

        return (!user.blockReason ||
            (blockAmount.forever == false &&
                ((blockAmount.days == null || blockAmount.weeks == null || blockAmount.months == null) ||
                    (blockAmount.days == 0 && blockAmount.weeks == 0 && blockAmount.months == 0) ||
                    (blockAmount.days < 0 || blockAmount.weeks < 0 || blockAmount.months < 0))));
    }

    openUserMenu(user: any) {
        let isOpen = !user.isMenuOpen;
        this.closeAllUsersMenu();
        user.isMenuOpen = isOpen;
    }

    closeUserMenu(user: any) {
        user.isMenuOpen = false;
    }

    saveChanges(user: any) {
        if (user.isEditScreenOpen && !this.isDisableSaveEdit(user)) {
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
            this.managementService.EditUser(updatedFields).then((updateResult: any) => {
                user.isSaveLoader = false;

                updateResult = updateResult ? updateResult.result : null;

                // In case the user info edit succeeded. 
                if (updateResult == true) {
                    if (updatedFields["password"]) {
                        delete updatedFields["password"];
                        this.socketService.SocketEmit("LogoutUserSessionServer",
                            "נותקת מהאתר, יש להתחבר מחדש",
                            user._id);
                    }

                    Object.keys(updatedFields).forEach(field => {
                        user[field] = updatedFields[field];
                    });

                    this.returnMainCard(user);
                    this.snackbarService.Snackbar("המשתמש עודכן בהצלחה");
                }
                // In case the updated email is already exists.
                else if (updateResult == -1) {
                    this.snackbarService.Snackbar("אימייל זה נמצא בשימוש")
                }
                else {
                    this.snackbarService.Snackbar("שגיאה בעדכון המשתמש");
                }
            });
        }
        else if (user.isBlockScreenOpen && !this.isDisableSaveBlocking(user)) {
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
                    this.returnMainCard(user);
                    this.snackbarService.Snackbar("חסימת המשתמש בוצעה בהצלחה");

                    let blockUserMsg = "חשבון זה נחסם" +
                        "{{enter}}" + "{{enter}}" +
                        "<b>סיבה: </b>" + user.block.reason +
                        "{{enter}}" +
                        "<b>עד תאריך: </b>" +
                        (user.block.unblockDate ? this.formatDate(user.block.unblockDate) : "בלתי מוגבל");

                    this.socketService.SocketEmit("LogoutUserSessionServer",
                        blockUserMsg,
                        user._id);
                }
                else {
                    this.snackbarService.Snackbar("שגיאה בחסימת המשתמש");
                }
            });
        }
    }

    unblockUser(user: any) {
        this.closeAllUsersMenu();
        let self = this;

        self.alertService.Alert({
            title: "ביטול חסימה - " + user.firstName + " " + user.lastName,
            text: "האם לבטל את החסימה?" + "\n\n" +
                "<b>סיבה - </b>" + user.block.reason + "\n" +
                "<b>עד תאריך - </b>" + (user.block.unblockDate ? self.formatDate(user.block.unblockDate) : "בלתי מוגבל"),
            type: ALERT_TYPE.INFO,
            confirmFunc: function () {
                self.managementService.unblockUser(user._id).then((result: any) => {
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

    isUserBlocked(user: any) {
        if (user.block &&
            (!user.block.unblockDate || new Date(user.block.unblockDate).getTime() > Date.now())) {
            return true;
        }
        else {
            return false;
        }
    }

    getUserWithOpenMenu() {
        for (let i = 0; i < this.users.length; i++) {
            if (this.users[i].isMenuOpen) {
                this.users[i].index = i;
                return this.users[i];
            }
        }

        return null;
    }

    closeAllUsersMenu() {
        this.users.forEach(user => {
            user.isMenuOpen = false;
        });
    }

    formatDate(date: Date) {
        date = new Date(date);
        return (date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear());
    }

    removeFriends(user: any, friend: any) {
        if (this.isDisableRemoveFriendBtn(friend)) {
            return;
        }

        let self = this;

        self.alertService.Alert({
            title: "הסרת חברות",
            text: "האם למחוק את החברות בין " + "<b>" + user.firstName + " " + user.lastName + "</b>\n" +
                "לבין " + "<b>" + friend.fullName + "</b>?",
            type: ALERT_TYPE.WARNING,
            confirmFunc: function () {
                self.managementService.removeFriends(user._id, friend._id).then((result: any) => {
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
                            self.snackbarService.Snackbar("החברות נמחקה");
                        }

                        let logoutMsg = "נותקת מהאתר, יש להתחבר מחדש.";
                        self.socketService.SocketEmit("LogoutUserSessionServer", logoutMsg, user._id);
                        self.socketService.SocketEmit("LogoutUserSessionServer", logoutMsg, friend._id);
                    }
                    else {
                        self.snackbarService.Snackbar("שגיאה במחיקת החברות");
                    }
                });
            }
        });
    }

    deleteUser(user: any) {
        let self = this;

        self.alertService.Alert({
            title: "מחיקת משתמש",
            text: "האם למחוק את המשתמש של <b>" + user.firstName + " " + user.lastName + "</b>?",
            type: ALERT_TYPE.WARNING,
            confirmFunc: function () {
                self.managementService.deleteUser(user._id,
                    user.firstName,
                    user.lastName,
                    user.email).then((result: any) => {
                        if (result) {
                            self.snackbarService.Snackbar("מחיקת המשתמש בוצעה בהצלחה");

                            // logout the user from the system.
                            let logoutMsg = "חשבונך נמחק מהמערכת לצמיתות." +
                                "{{enter}}" +
                                "לפרטים נוספים, פנה להנהלת האתר.";
                            self.socketService.SocketEmit("LogoutUserSessionServer", logoutMsg, user._id);

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
        let userWithOpenMenu = this.getUserWithOpenMenu();
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
                this.closeUserMenu(userWithOpenMenu);
            }
        }
    }
}