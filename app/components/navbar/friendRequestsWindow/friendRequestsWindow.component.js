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
var global_service_1 = require("../../../services/global/global.service");
var friendRequestsWindow_service_1 = require("../../../services/navbar/friendRequestsWindow/friendRequestsWindow.service");
var navbar_service_1 = require("../../../services/navbar/navbar.service");
var FriendRequestsWindowComponent = /** @class */ (function () {
    function FriendRequestsWindowComponent(navbarService, friendRequestsWindowService, globalService) {
        this.navbarService = navbarService;
        this.friendRequestsWindowService = friendRequestsWindowService;
        this.globalService = globalService;
        this.friendRequestsObjects = [];
        this.friendConfirmObjects = [];
        this.isFirstClosing = true;
        this.isFirstOpenning = true;
        this.isFriendRequestsLoaded = false;
    }
    FriendRequestsWindowComponent.prototype.ngOnInit = function () {
        var self = this;
        self.globalService.SocketOn('ClientUpdateFriendRequestsStatus', function (friendId) {
            self.friendRequestsObjects = self.friendRequestsObjects.filter(function (request) {
                return (request._id != friendId);
            });
        });
        self.globalService.SocketOn('GetFriendRequest', function () {
            self.LoadFriendRequestsObjects();
        });
        self.globalService.SocketOn('DeleteFriendRequest', function (friendId) {
            self.friendRequestsObjects = self.friendRequestsObjects.filter(function (request) {
                return (request._id != friendId);
            });
        });
    };
    FriendRequestsWindowComponent.prototype.ngOnChanges = function (changes) {
        // In case of loading data for the first time.
        if (changes.friendRequests &&
            changes.confirmedReuests &&
            !changes.friendRequests.firstChange &&
            !changes.confirmedReuests.firstChange &&
            !this.isFriendRequestsLoaded) {
            this.isFriendRequestsLoading = true;
            this.LoadFriendRequestsObjects();
        }
        // On first Openning.
        if (changes.isFriendRequestsWindowOpen &&
            changes.isFriendRequestsWindowOpen.currentValue &&
            !changes.isFriendRequestsWindowOpen.firstChange &&
            this.isFirstOpenning) {
            this.isFirstOpenning = false;
            if (this.confirmedReuests.length > 0) {
                // Removing friend requests confirm alerts from DB.
                this.friendRequestsWindowService.RemoveRequestConfirmAlert(this.confirmedReuests).then(function (result) { });
            }
        }
        // On first closing.
        if (changes.isFriendRequestsWindowOpen &&
            changes.isFriendRequestsWindowOpen.currentValue == false &&
            !changes.isFriendRequestsWindowOpen.firstChange &&
            this.isFirstClosing) {
            this.isFirstClosing = false;
            // Removing friend requests confirm alerts from client.
            this.friendConfirmObjects = [];
            this.confirmedReuests.splice(0);
        }
    };
    FriendRequestsWindowComponent.prototype.LoadFriendRequestsObjects = function () {
        var _this = this;
        if (this.friendRequests.length > 0 || this.confirmedReuests.length > 0) {
            this.navbarService.GetFriends(this.friendRequests.concat(this.confirmedReuests)).then(function (friendsResult) {
                if (friendsResult) {
                    _this.isFriendRequestsLoaded = true;
                    // Running on all friends and confirmed friends of the request.
                    friendsResult.forEach(function (friend) {
                        // In case the friend object is for friend request.
                        if (_this.friendRequests.indexOf(friend._id) != -1) {
                            _this.friendRequestsObjects.push(friend);
                        }
                        // In case the friend object is for friend request confirm notification.
                        else if (_this.confirmedReuests.indexOf(friend._id) != -1) {
                            _this.friendConfirmObjects.push(friend);
                        }
                    });
                }
                _this.isFriendRequestsLoading = false;
            });
        }
        else {
            this.isFriendRequestsLoading = false;
        }
    };
    FriendRequestsWindowComponent.prototype.GetFriendRequestsNumberText = function () {
        var friendRequestsNumber = this.friendRequests.length;
        if (friendRequestsNumber == 0) {
            return "אין בקשות חברות חדשות";
        }
        else if (friendRequestsNumber == 1) {
            return "בקשת חברות חדשה";
        }
        else {
            return (friendRequestsNumber + " בקשות חברות חדשות");
        }
    };
    FriendRequestsWindowComponent.prototype.FriendAccept = function (requestId) {
        this.isFriendRequestsLoading = true;
        var self = this;
        self.AddFriend(requestId, function (res) {
            self.isFriendRequestsLoading = false;
        });
    };
    FriendRequestsWindowComponent.prototype.FriendIgnore = function (requestId) {
        this.isFriendRequestsLoading = true;
        this.IgnoreFriendRequest(requestId, function (res) {
            this.isFriendRequestsLoading = false;
        });
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", Array)
    ], FriendRequestsWindowComponent.prototype, "isFriendRequestsWindowOpen", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Array)
    ], FriendRequestsWindowComponent.prototype, "friendRequests", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Function)
    ], FriendRequestsWindowComponent.prototype, "AddFriend", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Function)
    ], FriendRequestsWindowComponent.prototype, "IgnoreFriendRequest", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Array)
    ], FriendRequestsWindowComponent.prototype, "confirmedReuests", void 0);
    FriendRequestsWindowComponent = __decorate([
        core_1.Component({
            selector: 'friendRequestsWindow',
            templateUrl: './friendRequestsWindow.html',
            providers: [friendRequestsWindow_service_1.FriendRequestsWindowService]
        }),
        __metadata("design:paramtypes", [navbar_service_1.NavbarService,
            friendRequestsWindow_service_1.FriendRequestsWindowService,
            global_service_1.GlobalService])
    ], FriendRequestsWindowComponent);
    return FriendRequestsWindowComponent;
}());
exports.FriendRequestsWindowComponent = FriendRequestsWindowComponent;
//# sourceMappingURL=friendRequestsWindow.component.js.map