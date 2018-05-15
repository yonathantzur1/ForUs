"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var navbar_component_1 = require("../../../components/navbar/navbar.component");
var management_service_1 = require("../../../services/managementPanel/management/management.service");
var global_service_1 = require("../../../services/global/global.service");
var alert_service_1 = require("../../../services/alert/alert.service");
var ManagementComponent = /** @class */ (function () {
    function ManagementComponent(globalService, managementService, alertService) {
        var _this = this;
        this.globalService = globalService;
        this.managementService = managementService;
        this.alertService = alertService;
        this.users = [];
        this.friendsCache = {};
        this.friendsElementsPadding = 0;
        // Animation properties    
        this.openCardAnimationTime = 200;
        this.subscribeObj = this.globalService.data.subscribe(function (value) {
            if (value["closeDropMenu"]) {
                _this.CloseAllUsersMenu();
            }
        });
        document.body.addEventListener("click", this.clickFunction.bind(this));
        var self = this;
        self.dropMenuDataList = [
            new navbar_component_1.DropMenuData(null, "עריכה", function () {
                var user = self.GetUserWithOpenMenu();
                user.editObj = {};
                user.editObj.firstName = user.firstName;
                user.editObj.lastName = user.lastName;
                user.editObj.email = user.email;
                user.isEditScreenOpen = true;
            }),
            new navbar_component_1.DropMenuData(null, "חסימה", function () {
                var user = self.GetUserWithOpenMenu();
                user.blockAmount = {
                    days: 0,
                    weeks: 0,
                    months: 0,
                    forever: false
                };
                user.isBlockScreenOpen = true;
            }, function () {
                var user = self.GetUserWithOpenMenu();
                // Show only if the user is not already blocked.
                if (!user) {
                    return true;
                }
                else {
                    return (self.IsUserBlocked(user) == false);
                }
            }),
            new navbar_component_1.DropMenuData(null, "ביטול חסימה", function () {
                var user = self.GetUserWithOpenMenu();
                self.UnblockUser(user);
            }, function () {
                var user = self.GetUserWithOpenMenu();
                // Show only if the user is not already blocked.
                if (!user) {
                    return false;
                }
                else {
                    return (self.IsUserBlocked(user) == true);
                }
            }),
            new navbar_component_1.DropMenuData(null, "הרשאות", function () {
                self.globalService.setData("isOpenPermissionsCard", self.GetUserWithOpenMenu());
            }, function () {
                return (self.globalService.IsUserHasMasterPermission());
            }),
            new navbar_component_1.DropMenuData(null, "מחיקת משתמש", function () {
                var user = self.GetUserWithOpenMenu();
                self.DeleteUser(user);
            }, function () {
                return (self.globalService.IsUserHasMasterPermission());
            })
        ];
    }
    ManagementComponent.prototype.ngOnDestroy = function () {
        this.subscribeObj.unsubscribe();
        document.body.removeEventListener("click", this.clickFunction);
    };
    ManagementComponent.prototype.SearchUser = function () {
        var _this = this;
        if (this.searchInput && (this.searchInput = this.searchInput.trim())) {
            this.isLoadingUsers = true;
            this.managementService.GetUserByName(this.searchInput).then(function (results) {
                _this.isLoadingUsers = false;
                if (results && results.length > 0) {
                    _this.isShowNotFoundUsersMessage = false;
                    _this.users = results;
                    // Empty old result friends cache.
                    _this.friendsCache = {};
                    // Open user card in case only one result found.
                    if (_this.users.length == 1) {
                        _this.users[0].isOpen = true;
                        _this.isPreventFirstOpenCardAnimation = true;
                    }
                }
                else {
                    _this.users = [];
                    _this.isShowNotFoundUsersMessage = true;
                }
            });
        }
    };
    ManagementComponent.prototype.SearhUserInputKeyup = function (event) {
        // In case of pressing ENTER.
        if (event.keyCode == 13) {
            this.SearchUser();
        }
    };
    ManagementComponent.prototype.ReturnMainCard = function (user) {
        user.friendSearchInput = null;
        user.isFriendsScreenOpen = false;
        user.isEditScreenOpen = false;
        user.blockReason = null;
        user.isBlockScreenOpen = false;
    };
    ManagementComponent.prototype.ShowHideUserCard = function (user) {
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
    };
    ManagementComponent.prototype.GetInfoDateString = function (date) {
        var dateObj = new Date(date);
        var dateString = (dateObj.getDate()) + "/" + (dateObj.getMonth() + 1) + "/" + dateObj.getFullYear();
        var HH = dateObj.getHours().toString();
        var mm = dateObj.getMinutes().toString();
        if (mm.length == 1) {
            mm = "0" + mm;
        }
        var timeString = (HH + ":" + mm);
        return (dateString + " - " + timeString);
    };
    ManagementComponent.prototype.OpenFriendsScreen = function (user) {
        var _this = this;
        // In case the user has friends.
        if (user.friendsNumber > 0) {
            user.isMenuOpen = false;
            user.isFriendsScreenOpen = true;
            if (!user.isFriendsObjectsLoaded) {
                var noneCachedFriendsIds = this.GetNoneCachedFriendsIds(user.friends);
                if (noneCachedFriendsIds.length > 0) {
                    this.managementService.GetUserFriends(noneCachedFriendsIds).then(function (friends) {
                        friends && friends.forEach(function (friend) {
                            _this.friendsCache[friend._id] = friend;
                        });
                        user.isFriendsObjectsLoaded = true;
                    });
                }
                else {
                    user.isFriendsObjectsLoaded = true;
                }
            }
        }
    };
    ManagementComponent.prototype.GetNoneCachedFriendsIds = function (friendsIds) {
        var self = this;
        return friendsIds.filter(function (id) {
            return (self.friendsCache[id] == null);
        });
    };
    ManagementComponent.prototype.GetFriendsObjectsFromIds = function (friendsIds, friendSearchInput) {
        var self = this;
        var friends = friendsIds.map(function (id) {
            return self.friendsCache[id];
        });
        if (friendSearchInput && (friendSearchInput = friendSearchInput.trim())) {
            // Filter friends by the search field.
            return friends.filter(function (friend) {
                return (friend.fullName.indexOf(friendSearchInput) == 0 ||
                    friend.fullNameReversed.indexOf(friendSearchInput) == 0);
            });
        }
        else {
            return friends;
        }
    };
    // Calculate align friends elements to center of screen.
    ManagementComponent.prototype.CalculateFriendsElementsPadding = function () {
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
    };
    ManagementComponent.prototype.IsDisableSaveEdit = function (user) {
        var editObj = user.editObj;
        return (editObj.firstName == user.firstName &&
            editObj.lastName == user.lastName &&
            editObj.email == user.email &&
            !editObj.password);
    };
    ManagementComponent.prototype.IsDisableSaveBlocking = function (user) {
        var blockAmount = user.blockAmount;
        return (!user.blockReason ||
            (blockAmount.forever == false &&
                ((blockAmount.days == null || blockAmount.weeks == null || blockAmount.months == null) ||
                    (blockAmount.days == 0 && blockAmount.weeks == 0 && blockAmount.months == 0) ||
                    (blockAmount.days < 0 || blockAmount.weeks < 0 || blockAmount.months < 0))));
    };
    ManagementComponent.prototype.OpenUserMenu = function (user) {
        var isOpen = !user.isMenuOpen;
        this.CloseAllUsersMenu();
        user.isMenuOpen = isOpen;
    };
    ManagementComponent.prototype.CloseUserMenu = function (user) {
        user.isMenuOpen = false;
    };
    ManagementComponent.prototype.SaveChanges = function (user) {
        var _this = this;
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
            this.managementService.EditUser(updateFields).then(function (result) {
                user.isSaveLoader = false;
                // In case the user info edit succeeded. 
                if (result) {
                    if (updateFields["password"]) {
                        delete updateFields["password"];
                        _this.globalService.socket.emit("LogoutUserSessionServer", user._id, "נותקת מהאתר, יש להתחבר מחדש");
                    }
                    Object.keys(updateFields).forEach(function (field) {
                        user[field] = updateFields[field];
                    });
                    _this.ReturnMainCard(user);
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
            };
            user.isSaveLoader = true;
            this.managementService.BlockUser(blockObj).then(function (result) {
                user.isSaveLoader = false;
                if (result) {
                    user.block = result;
                    _this.ReturnMainCard(user);
                    snackbar("חסימת המשתמש בוצעה בהצלחה");
                    var blockUserMsg = "חשבון זה נחסם" + "\n\n" +
                        "<b>סיבה: </b>" + user.block.reason + "\n" +
                        "<b>עד תאריך: </b>" +
                        (user.block.unblockDate ? _this.ConvertDateFormat(user.block.unblockDate) : "בלתי מוגבל");
                    _this.globalService.socket.emit("LogoutUserSessionServer", user._id, blockUserMsg);
                }
                else {
                    snackbar("שגיאה בחסימת המשתמש");
                }
            });
        }
    };
    ManagementComponent.prototype.UnblockUser = function (user) {
        this.CloseAllUsersMenu();
        var self = this;
        self.alertService.Alert({
            title: "ביטול חסימה - " + user.firstName + " " + user.lastName,
            text: "האם לבטל את החסימה?" + "\n\n" +
                "<b>סיבה - </b>" + user.block.reason + "\n" +
                "<b>עד תאריך - </b>" + (user.block.unblockDate ? self.ConvertDateFormat(user.block.unblockDate) : "בלתי מוגבל"),
            type: "info",
            confirmFunc: function () {
                self.managementService.UnblockUser(user._id).then(function (result) {
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
    };
    ManagementComponent.prototype.IsUserBlocked = function (user) {
        if (user.block &&
            (!user.block.unblockDate || new Date(user.block.unblockDate).getTime() > Date.now())) {
            return true;
        }
        else {
            return false;
        }
    };
    ManagementComponent.prototype.GetUserWithOpenMenu = function () {
        for (var i = 0; i < this.users.length; i++) {
            if (this.users[i].isMenuOpen) {
                this.users[i].index = i;
                return this.users[i];
            }
        }
        return null;
    };
    ManagementComponent.prototype.CloseAllUsersMenu = function () {
        this.users.forEach(function (user) {
            user.isMenuOpen = false;
        });
    };
    ManagementComponent.prototype.ConvertDateFormat = function (date) {
        date = new Date(date);
        return (date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear());
    };
    ManagementComponent.prototype.RemoveFriends = function (user, friend) {
        var self = this;
        self.alertService.Alert({
            title: "הסרת חברות",
            text: "האם למחוק את החברות בין " + "<b>" + user.firstName + " " + user.lastName + "</b>\n" +
                "לבין " + "<b>" + friend.fullName + "</b>?",
            type: "warning",
            confirmFunc: function () {
                self.managementService.RemoveFriends(user._id, friend._id).then(function (result) {
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
    };
    ManagementComponent.prototype.DeleteUser = function (user) {
        var self = this;
        self.alertService.Alert({
            title: "מחיקת משתמש",
            text: "האם למחוק את המשתמש של <b>" + user.firstName + " " + user.lastName + "</b>?",
            type: "warning",
            confirmFunc: function () {
                self.managementService.DeleteUser(user._id).then(function (result) {
                    if (result) {
                        snackbar("מחיקת המשתמש בוצעה בהצלחה");
                        // Logout the user from the system.
                        var logoutMsg = "חשבונך נמחק מהמערכת לצמיתות. \nלפרטים נוספים, פנה להנהלת האתר.";
                        self.globalService.socket.emit("LogoutUserSessionServer", user._id, logoutMsg);
                        // Remove user from users search list.
                        self.users.splice(user.index, 1);
                        // Remove all instances of the user from his friends.
                        self.globalService.socket.emit("ServerRemoveFriendUser", user._id, user.firstName + " " + user.lastName, result);
                    }
                    else {
                        snackbar("שגיאה במחיקת המשתמש");
                    }
                });
            }
        });
    };
    ManagementComponent.prototype.clickFunction = function (e) {
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
    };
    ManagementComponent = __decorate([
        core_1.Component({
            selector: 'management',
            templateUrl: './management.html',
            providers: [management_service_1.ManagementService]
        }),
        __metadata("design:paramtypes", [global_service_1.GlobalService,
            management_service_1.ManagementService,
            alert_service_1.AlertService])
    ], ManagementComponent);
    return ManagementComponent;
}());
exports.ManagementComponent = ManagementComponent;
//# sourceMappingURL=management.component.js.map