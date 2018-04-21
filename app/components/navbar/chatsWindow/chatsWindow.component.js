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
var chatsWindow_service_1 = require("../../../services/navbar/chatsWindow/chatsWindow.service");
var global_service_1 = require("../../../services/global/global.service");
var ChatsWindowComponent = /** @class */ (function () {
    function ChatsWindowComponent(chatsWindowService, globalService) {
        this.chatsWindowService = chatsWindowService;
        this.globalService = globalService;
        this.chats = [];
    }
    ChatsWindowComponent.prototype.ngOnInit = function () {
        this.isChatsLoading = true;
        this.LoadChatsObjects();
        var self = this;
        self.globalService.SocketOn('ClientUpdateSendMessage', function (msgData) {
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
        self.globalService.SocketOn('ClientUpdateGetMessage', function (msgData) {
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
        self.globalService.SocketOn('ClientRemoveFriendUser', function (friendId) {
            self.RemoveFriendChat(friendId);
        });
    };
    ChatsWindowComponent.prototype.LoadChatsObjects = function () {
        this.isLoading = true;
        this.chatsWindowService.GetAllChats().then((function (chats) {
            this.isLoading = false;
            this.chats = chats;
            this.isChatsLoading = false;
        }).bind(this));
    };
    ChatsWindowComponent.prototype.GetUnreadMessagesNumber = function () {
        var _this = this;
        var counter = 0;
        Object.keys(this.messagesNotifications).forEach(function (id) {
            counter += _this.messagesNotifications[id].unreadMessagesNumber;
        });
        return counter;
    };
    ChatsWindowComponent.prototype.GetUnreadMessagesNumberText = function () {
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
    ChatsWindowComponent.prototype.CalculateChatTimeString = function (chat) {
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
        if (diffDays <= 7) {
            dateTimeString = HH + ":" + mm;
        }
        chat.timeString = { "dateDetailsString": GetDateDetailsString(localDate, currDate, true), "dateTimeString": dateTimeString };
    };
    ChatsWindowComponent.prototype.GetFriendName = function (friend) {
        if (!friend) {
            return null;
        }
        else {
            return (friend.firstName + " " + friend.lastName);
        }
    };
    ChatsWindowComponent.prototype.GetFriendProfile = function (friend) {
        if (!friend) {
            return null;
        }
        else {
            return (friend.profileImage);
        }
    };
    ChatsWindowComponent.prototype.SortByDate = function (chats) {
        chats = chats.sort(function (a, b) {
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
    ChatsWindowComponent.prototype.RemoveFriendChat = function (friendId) {
        for (var i = 0; i < this.chats.length; i++) {
            if (this.chats[i].friendId == friendId) {
                this.chats.splice(i, 1);
                break;
            }
        }
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", Object)
    ], ChatsWindowComponent.prototype, "messagesNotifications", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Function)
    ], ChatsWindowComponent.prototype, "OpenChat", void 0);
    ChatsWindowComponent = __decorate([
        core_1.Component({
            selector: 'chatsWindow',
            templateUrl: './chatsWindow.html',
            providers: [chatsWindow_service_1.ChatsWindowService]
        }),
        __metadata("design:paramtypes", [chatsWindow_service_1.ChatsWindowService, global_service_1.GlobalService])
    ], ChatsWindowComponent);
    return ChatsWindowComponent;
}());
exports.ChatsWindowComponent = ChatsWindowComponent;
//# sourceMappingURL=chatsWindow.component.js.map