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
var navbar_component_1 = require("../../components/navbar/navbar.component");
var management_service_1 = require("../../services/management/management.service");
var global_service_1 = require("../../services/global/global.service");
var alert_service_1 = require("../../services/alert/alert.service");
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
            new navbar_component_1.DropMenuData(null, "חסימת משתמש", function () {
                var user = self.GetUserWithOpenMenu();
                user.blockAmount = {
                    days: 0,
                    weeks: 0,
                    months: 0,
                    forever: false
                };
                user.isBlockScreenOpen = true;
            })
        ];
    }
    ManagementComponent.prototype.ngOnDestroy = function () {
        var self = this;
        self.subscribeObj.unsubscribe();
    };
    ManagementComponent.prototype.SearchUser = function () {
        var _this = this;
        if (this.searchInput && (this.searchInput = this.searchInput.trim())) {
            this.isLoadingUsers = true;
            this.managementService.GetUserByName(this.searchInput).then(function (results) {
                _this.isLoadingUsers = false;
                if (results != null) {
                    _this.users = results;
                    // Empty old result friends cache.
                    _this.friendsCache = {};
                    // Open user card in case only one result found.
                    if (_this.users.length == 1) {
                        _this.users[0].isOpen = true;
                        _this.isPreventFirstOpenCardAnimation = true;
                    }
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
        // Open the card in case it is close.
        if (!user.isOpen) {
            user.isOpen = true;
            user.isOpenCardAnimationActive = true;
            setTimeout(function () {
                user.isOpenCardAnimationActive = false;
            }, this.openCardAnimationTime);
        }
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
        this.CloseAllUsersMenu();
        user.isMenuOpen = true;
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
                    $("#edit-user-success").snackbar("show");
                }
                else {
                    $("#edit-user-error").snackbar("show");
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
                    $("#block-user-success").snackbar("show");
                    var blockUserMsg = "חשבון זה נחסם" + "\n\n" +
                        "<b>סיבה: </b>" + user.block.reason + "\n" +
                        "<b>עד תאריך: </b>" +
                        (user.block.unblockDate ? _this.ConvertDateFormat(user.block.unblockDate) : "בלתי מוגבל");
                    // this.globalService.socket.emit("LogoutUserSessionServer",
                    //     user._id,
                    //     blockUserMsg);
                }
                else {
                    $("#block-user-error").snackbar("show");
                }
            });
        }
    };
    ManagementComponent.prototype.GetUserWithOpenMenu = function () {
        for (var i = 0; i < this.users.length; i++) {
            if (this.users[i].isMenuOpen) {
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
    ManagementComponent.prototype.OnClick = function (event) {
        var isClickInsideMenu = false;
        for (var i = 0; i < event.path.length; i++) {
            if (event.path[i].id == "user-settings-icon" || event.path[i].id == "dropMenu") {
                isClickInsideMenu = true;
                break;
            }
        }
        if (!isClickInsideMenu) {
            this.CloseAllUsersMenu();
        }
    };
    ManagementComponent.prototype.UnblockUser = function (user) {
        var self = this;
        self.alertService.Alert({
            title: "ביטול חסימה - " + user.firstName + " " + user.lastName,
            text: "האם לבטל את החסימה?" + "\n\n" +
                "<b>סיבה: </b>" + user.block.reason + "\n" +
                "<b>עד תאריך: </b>" + (user.block.unblockDate ? self.ConvertDateFormat(user.block.unblockDate) : "בלתי מוגבל"),
            type: "info",
            confirmFunc: function () {
                self.managementService.UnblockUser(user._id).then(function (result) {
                    if (result) {
                        delete user.block;
                        $("#unblock-user-success").snackbar("show");
                    }
                    else {
                        $("#unblock-user-error").snackbar("show");
                    }
                });
            }
        });
    };
    ManagementComponent.prototype.ConvertDateFormat = function (date) {
        date = new Date(date);
        return (date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear());
    };
    ManagementComponent = __decorate([
        core_1.Component({
            selector: 'management',
            templateUrl: './management.html',
            providers: [management_service_1.ManagementService],
            host: {
                '(document:click)': 'OnClick($event)',
                '(document:touchstart)': 'OnClick($event)'
            }
        }),
        __metadata("design:paramtypes", [global_service_1.GlobalService,
            management_service_1.ManagementService,
            alert_service_1.AlertService])
    ], ManagementComponent);
    return ManagementComponent;
}());
exports.ManagementComponent = ManagementComponent;
//# sourceMappingURL=management.component.js.map