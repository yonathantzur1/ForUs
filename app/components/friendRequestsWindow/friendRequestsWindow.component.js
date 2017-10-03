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
var friendRequestsWindow_service_1 = require("../../services/friendRequestsWindow/friendRequestsWindow.service");
var FriendRequestsWindowComponent = /** @class */ (function () {
    function FriendRequestsWindowComponent(friendRequestsWindowService) {
        this.friendRequestsWindowService = friendRequestsWindowService;
        this.defaultProfileImage = "./app/components/profilePicture/pictures/empty-profile.png";
        this.GetFriendRequestsNumberText = function () {
            var friendRequestsNumber = this.friendRequests.length;
            if (friendRequestsNumber == 0) {
                return "אין בקשות חברות חדשות";
            }
            else if (friendRequestsNumber == 1) {
                return "בקשת חברות 1 חדשה";
            }
            else {
                return (friendRequestsNumber + " בקשות חברות חדשות");
            }
        };
    }
    FriendRequestsWindowComponent.prototype.ngOnInit = function () {
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", Array)
    ], FriendRequestsWindowComponent.prototype, "friendRequests", void 0);
    FriendRequestsWindowComponent = __decorate([
        core_1.Component({
            selector: 'friendRequestsWindow',
            templateUrl: './friendRequestsWindow.html',
            providers: [friendRequestsWindow_service_1.FriendRequestsWindowService]
        }),
        __metadata("design:paramtypes", [friendRequestsWindow_service_1.FriendRequestsWindowService])
    ], FriendRequestsWindowComponent);
    return FriendRequestsWindowComponent;
}());
exports.FriendRequestsWindowComponent = FriendRequestsWindowComponent;
//# sourceMappingURL=friendRequestsWindow.component.js.map