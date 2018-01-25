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
var management_service_1 = require("../../services/management/management.service");
var global_service_1 = require("../../services/global/global.service");
var ManagementComponent = /** @class */ (function () {
    function ManagementComponent(globalService, managementService) {
        this.globalService = globalService;
        this.managementService = managementService;
        this.users = [];
        // Animation properties    
        this.openCardAnimationTime = 200;
    }
    ManagementComponent.prototype.SearchUser = function () {
        var _this = this;
        if (this.searchInput && (this.searchInput = this.searchInput.trim())) {
            this.isLoadingUsers = true;
            this.managementService.GetUserByName(this.searchInput).then(function (results) {
                _this.isLoadingUsers = false;
                if (results != null) {
                    _this.users = results;
                    // Open user card in case only one result found.
                    if (_this.users.length == 1) {
                        _this.users[0].isOpen = true;
                        _this.isPreventFirstOpenCardAnimation = true;
                    }
                }
            });
        }
    };
    ManagementComponent.prototype.InputKeyup = function (event) {
        // In case of pressing ENTER.
        if (event.keyCode == 13) {
            this.SearchUser();
        }
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
            user.isFriendsScreenOpen = false;
            this.isPreventFirstOpenCardAnimation = false;
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
        user.isFriendsScreenOpen = true;
        if (!user.friendsObjects) {
            this.managementService.GetUserFriends(user.friends).then(function (friends) {
                if (friends) {
                    user.friendsObjects = friends;
                }
            });
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
        return (freeWidthSpace / 2);
    };
    ManagementComponent = __decorate([
        core_1.Component({
            selector: 'management',
            templateUrl: './management.html',
            providers: [management_service_1.ManagementService]
        }),
        __metadata("design:paramtypes", [global_service_1.GlobalService, management_service_1.ManagementService])
    ], ManagementComponent);
    return ManagementComponent;
}());
exports.ManagementComponent = ManagementComponent;
//# sourceMappingURL=management.component.js.map