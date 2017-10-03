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
var unreadWindow_service_1 = require("../../services/unreadWindow/unreadWindow.service");
var UnreadWindowComponent = /** @class */ (function () {
    function UnreadWindowComponent(unreadWindowService) {
        this.unreadWindowService = unreadWindowService;
        this.chats = [];
        this.defaultProfileImage = "./app/components/profilePicture/pictures/empty-profile.png";
        this.GetUnreadMessagesNumber = function () {
            var _this = this;
            var counter = 0;
            Object.keys(this.messagesNotifications).forEach(function (id) {
                counter += _this.messagesNotifications[id].unreadMessagesNumber;
            });
            return counter;
        };
        this.GetUnreadMessagesNumberText = function () {
            var unreadMessagesNumber = this.GetUnreadMessagesNumber();
            if (unreadMessagesNumber == 0) {
                return "שיחות אחרונות";
            }
            else if (unreadMessagesNumber == 1) {
                return "הודעה 1 שלא נקראה";
            }
            else {
                return (unreadMessagesNumber + " הודעות שלא נקראו");
            }
        };
        this.GetTimeString = function (date) {
            var localDate = new Date(date);
            var HH = localDate.getHours().toString();
            var mm = localDate.getMinutes().toString();
            if (HH.length == 1) {
                HH = "0" + HH;
            }
            if (mm.length == 1) {
                mm = "0" + mm;
            }
            return (HH + ":" + mm);
        };
        this.GetFriend = function (friendId) {
            return (this.friends.find(function (friend) {
                return (friend._id == friendId);
            }));
        };
        this.GetFriendName = function (friendId) {
            var friendObj = (this.friends.find(function (friend) {
                return (friend._id == friendId);
            }));
            return (friendObj.firstName + " " + friendObj.lastName);
        };
    }
    UnreadWindowComponent.prototype.ngOnInit = function () {
        var self = this;
        this.isChatsLoading = true;
        self.unreadWindowService.GetAllChats().then(function (chats) {
            self.chats = chats;
            self.isChatsLoading = false;
        });
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", Array)
    ], UnreadWindowComponent.prototype, "friends", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Object)
    ], UnreadWindowComponent.prototype, "messagesNotifications", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Function)
    ], UnreadWindowComponent.prototype, "OpenChat", void 0);
    UnreadWindowComponent = __decorate([
        core_1.Component({
            selector: 'unreadWindow',
            templateUrl: './unreadWindow.html',
            providers: [unreadWindow_service_1.UnreadWindowService]
        }),
        __metadata("design:paramtypes", [unreadWindow_service_1.UnreadWindowService])
    ], UnreadWindowComponent);
    return UnreadWindowComponent;
}());
exports.UnreadWindowComponent = UnreadWindowComponent;
//# sourceMappingURL=unreadWindow.component.js.map