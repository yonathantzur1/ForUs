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
var global_service_1 = require("../../services/global/global.service");
var UnreadWindowComponent = /** @class */ (function () {
    function UnreadWindowComponent(unreadWindowService, globalService) {
        this.unreadWindowService = unreadWindowService;
        this.globalService = globalService;
        this.days = globalVariables.days;
        this.months = globalVariables.shortMonths;
        this.chats = [];
        this.defaultProfileImage = "./app/components/profilePicture/pictures/empty-profile.png";
        this.isRefreshActive = false;
        this.LoadChatsObjects = function () {
            var self = this;
            self.unreadWindowService.GetAllChats().then(function (chats) {
                self.chats = chats;
                self.isChatsLoading = false;
                self.isRefreshActive = false;
            });
        };
        this.GetUnreadMessagesNumber = function () {
            var _this = this;
            var counter = 0;
            Object.keys(this.messagesNotifications).forEach(function (id) {
                counter += _this.messagesNotifications[id].unreadMessagesNumber;
            });
            return counter;
        };
        this.GetUnreadMessagesNumberText = function () {
            if (this.chats.length == 0) {
                return "אין הודעות חדשות";
            }
            else {
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
            }
        };
        this.CalculateChatTimeString = function (chat) {
            var localDate = new Date(chat.lastMessage.time);
            var currDate = new Date();
            currDate.setHours(23, 59, 59, 999);
            var HH = localDate.getHours().toString();
            var mm = localDate.getMinutes().toString();
            if (mm.length == 1) {
                mm = "0" + mm;
            }
            var dateTimeString = "";
            var timeDiff = Math.abs(currDate.getTime() - localDate.getTime());
            var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
            var datesDaysDiff = Math.abs(currDate.getDay() - localDate.getDay());
            var dateDetailsString = "";
            if (diffDays <= 7) {
                if (diffDays <= 2) {
                    if (currDate.getDate() == localDate.getDate()) {
                        dateDetailsString = "היום";
                    }
                    else if (Math.min((7 - datesDaysDiff), datesDaysDiff) <= 1) {
                        dateDetailsString = "אתמול";
                    }
                    else {
                        dateDetailsString = this.days[localDate.getDay()];
                    }
                }
                else {
                    dateDetailsString = this.days[localDate.getDay()];
                }
                dateTimeString = HH + ":" + mm;
            }
            else {
                if (localDate.getFullYear() == currDate.getFullYear()) {
                    dateDetailsString = (localDate.getDate()) + " " + this.months[localDate.getMonth()];
                }
                else {
                    dateDetailsString = (localDate.getDate()) + "/" + (localDate.getMonth() + 1) + "/" + localDate.getFullYear();
                }
            }
            chat.timeString = { "dateDetailsString": dateDetailsString, "dateTimeString": dateTimeString };
        };
        this.GetFriend = function (friendId) {
            return (this.friends.find(function (friend) {
                return (friend._id == friendId);
            }));
        };
        this.GetFriendName = function (friendId) {
            var friendObj = this.GetFriend(friendId);
            return friendObj ? (friendObj.firstName + " " + friendObj.lastName) : "";
        };
        this.GetFriendProfile = function (friendId) {
            var friendObj = this.GetFriend(friendId);
            return friendObj ? friendObj.profileImage : null;
        };
        this.SortByDate = function (chats) {
            chats.sort(function (a, b) {
                var firstDate = new Date(a.lastMessage.time);
                var secondDate = new Date(b.lastMessage.time);
                if (firstDate > secondDate) {
                    return -1;
                }
                else if (firstDate < secondDate) {
                    return 1;
                }
                else {
                    return 0;
                }
            });
            return chats;
        };
        this.socket = globalService.socket;
    }
    UnreadWindowComponent.prototype.ngOnInit = function () {
        var self = this;
        this.isChatsLoading = true;
        this.LoadChatsObjects();
        self.socket.on('ClientUpdateSendMessage', function (msgData) {
            var isChatUpdated = false;
            for (var i = 0; i < self.chats.length; i++) {
                var chat = self.chats[i];
                if (chat.friendId == msgData.to) {
                    chat.lastMessage.text = msgData.isImage ? "" : msgData.text;
                    chat.lastMessage.time = (new Date()).toISOString();
                    chat.lastMessage.isImage = msgData.isImage ? true : false;
                    isChatUpdated = true;
                    break;
                }
            }
            if (!isChatUpdated) {
                self.LoadChatsObjects();
            }
        });
        self.socket.on('ClientUpdateGetMessage', function (msgData) {
            var isChatUpdated = false;
            for (var i = 0; i < self.chats.length; i++) {
                var chat = self.chats[i];
                if (chat.friendId == msgData.from) {
                    chat.lastMessage.text = msgData.isImage ? "" : msgData.text;
                    chat.lastMessage.time = (new Date()).toISOString();
                    chat.lastMessage.isImage = msgData.isImage ? true : false;
                    isChatUpdated = true;
                    break;
                }
            }
            if (!isChatUpdated) {
                self.LoadChatsObjects();
            }
        });
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], UnreadWindowComponent.prototype, "isFriendsLoading", void 0);
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
        __metadata("design:paramtypes", [unreadWindow_service_1.UnreadWindowService, global_service_1.GlobalService])
    ], UnreadWindowComponent);
    return UnreadWindowComponent;
}());
exports.UnreadWindowComponent = UnreadWindowComponent;
//# sourceMappingURL=unreadWindow.component.js.map