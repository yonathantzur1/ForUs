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
var chat_service_1 = require("../../services/chat/chat.service");
var global_service_1 = require("../../services/global/global.service");
var ChatComponent = /** @class */ (function () {
    function ChatComponent(chatService, globalService) {
        var _this = this;
        this.chatService = chatService;
        this.globalService = globalService;
        this.messages = [];
        this.token = getToken();
        this.chatBodyScrollHeight = 0;
        this.InitializeChat = function () {
            var _this = this;
            var self = this;
            self.isAllowShowUnreadLine = true;
            self.chatBodyScrollHeight = 0;
            self.isMessagesLoading = true;
            self.chatService.GetChat([self.chatData.user._id, self.chatData.friend._id], getToken()).then(function (chat) {
                if (chat) {
                    self.messages = chat.messages;
                }
                self.isMessagesLoading = false;
                $("#msg-input").focus();
                _this.globalService.deleteData("chatData");
            });
        };
        this.CloseChat = function () {
            this.chatData.isOpen = false;
        };
        this.SendMessage = function () {
            if (!this.isMessagesLoading) {
                // Delete spaces from the start and the end of the message text.
                this.msghInput = this.msghInput.trim();
                if (this.msghInput) {
                    var msgData = {
                        "from": this.chatData.user._id,
                        "to": this.chatData.friend._id,
                        "text": this.msghInput,
                        "time": new Date()
                    };
                    this.msghInput = "";
                    this.isAllowShowUnreadLine = false;
                    this.messages.push(msgData);
                    this.socket.emit("SendMessage", msgData, this.token);
                }
            }
        };
        this.MsgInputKeyup = function (event) {
            // In case of pressing ENTER.
            if (event.keyCode == 13) {
                this.SendMessage();
            }
            else if (event.keyCode == 27) {
                this.CloseChat();
            }
        };
        this.ScrollToBottom = function () {
            $("#chat-body-sector")[0].scrollTop = $("#chat-body-sector")[0].scrollHeight;
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
        this.IsShowUnreadLine = function (msgFromId, msgId) {
            var friendMessagesNotifications = this.chatData.messagesNotifications[msgFromId];
            if (this.isAllowShowUnreadLine &&
                friendMessagesNotifications &&
                msgId == friendMessagesNotifications.firstUnreadMessageId) {
                this.unreadMessagesNumber = friendMessagesNotifications.unreadMessagesNumber;
                return true;
            }
            else {
                return false;
            }
        };
        this.GetUnreadMessagesNumberText = function (unreadMessagesNumber) {
            if (unreadMessagesNumber == 1) {
                return ("הודעה 1 שלא נקראה");
            }
            else {
                return (unreadMessagesNumber + " הודעות שלא נקראו");
            }
        };
        this.socket = globalService.socket;
        this.globalService.data.subscribe(function (value) {
            if (value["chatData"]) {
                _this.messages = [];
                _this.chatData = value["chatData"];
                _this.InitializeChat();
            }
        });
    }
    ChatComponent.prototype.ngOnInit = function () {
        var self = this;
        self.socket.on('GetMessage', function (msgData) {
            if (msgData.from == self.chatData.friend._id) {
                msgData.time = new Date();
                self.messages.push(msgData);
            }
        });
    };
    ChatComponent.prototype.ngAfterViewChecked = function () {
        if ($("#chat-body-sector")[0].scrollHeight != this.chatBodyScrollHeight) {
            this.ScrollToBottom();
            this.chatBodyScrollHeight = $("#chat-body-sector")[0].scrollHeight;
        }
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", Object)
    ], ChatComponent.prototype, "chatData", void 0);
    ChatComponent = __decorate([
        core_1.Component({
            selector: 'chat',
            templateUrl: './chat.html',
            providers: [chat_service_1.ChatService]
        }),
        __metadata("design:paramtypes", [chat_service_1.ChatService, global_service_1.GlobalService])
    ], ChatComponent);
    return ChatComponent;
}());
exports.ChatComponent = ChatComponent;
//# sourceMappingURL=chat.component.js.map