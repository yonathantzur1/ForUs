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
var global_service_1 = require("../../services/global/global.service");
var friendRequestsWindow_service_1 = require("../../services/friendRequestsWindow/friendRequestsWindow.service");
var navbar_service_1 = require("../../services/navbar/navbar.service");
var FriendRequestsWindowComponent = /** @class */ (function () {
    function FriendRequestsWindowComponent(navbarService, friendRequestsWindowService, globalService) {
        this.navbarService = navbarService;
        this.friendRequestsWindowService = friendRequestsWindowService;
        this.globalService = globalService;
        this.defaultProfileImage = "./app/components/profilePicture/pictures/empty-profile.png";
        this.friendRequestsObjects = [];
        this.isFirstFriendRequestsObjectsLoaded = false;
        this.isFriendRequestsLoading = false;
        this.LoadFriendRequestsObjects = function () {
            var _this = this;
            if (this.friendRequests.length > 0) {
                this.navbarService.GetFriends(this.friendRequests).then(function (friendsResult) {
                    _this.friendRequestsObjects = friendsResult;
                    _this.isFriendRequestsLoading = false;
                });
            }
            else {
                this.friendRequestsObjects = [];
                this.isFriendRequestsLoading = false;
            }
        };
        this.GetFriendRequestsNumberText = function () {
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
        this.FriendRequestBtnClicked = function (friendId) {
            this.socket.emit("ServerUpdateFriendRequestsStatus", friendId);
        };
        this.socket = globalService.socket;
    }
    FriendRequestsWindowComponent.prototype.ngOnInit = function () {
        var self = this;
        self.socket.on('ClientUpdateFriendRequestsStatus', function (friendId) {
            self.friendRequestsObjects = self.friendRequestsObjects.filter(function (request) {
                return (request._id != friendId);
            });
        });
        self.socket.on('GetFriendRequest', function () {
            self.LoadFriendRequestsObjects();
        });
        self.socket.on('DeleteFriendRequest', function (friendId) {
            self.friendRequestsObjects = self.friendRequestsObjects.filter(function (request) {
                return (request._id != friendId);
            });
        });
    };
    FriendRequestsWindowComponent.prototype.ngOnChanges = function (changes) {
        // In case of loading data for the first time.
        if (changes.friendRequests &&
            !changes.friendRequests.firstChange &&
            !this.isFirstFriendRequestsObjectsLoaded) {
            this.isFirstFriendRequestsObjectsLoaded = true;
            this.isFriendRequestsLoading = true;
            this.LoadFriendRequestsObjects();
        }
    };
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