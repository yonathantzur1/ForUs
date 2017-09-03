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
var ChatComponent = (function () {
    function ChatComponent(chatService) {
        this.chatService = chatService;
        this.messages = [];
        this.token = getToken();
        this.CloseChat = function () {
            this.chatData.isOpen = false;
        };
        this.SendMessage = function () {
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
                this.messages.push(msgData);
                this.socket.emit("SendMessage", msgData, this.token);
            }
        };
        this.MsgInputKeyup = function (event) {
            if (event.code == "Enter") {
                this.SendMessage();
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
    }
    ChatComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.chatService.GetChat([this.chatData.user._id, this.chatData.friend._id], getToken()).then(function (chat) {
            if (chat) {
                _this.messages = chat.messages;
            }
        });
        var self = this;
        this.socket = this.chatData.socket;
        this.socket.on('GetMessage', function (msgData) {
            msgData.time = new Date();
            self.messages.push(msgData);
        });
        $("#chat-body-sector").bind("DOMNodeInserted", function () {
            self.ScrollToBottom();
        });
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
        __metadata("design:paramtypes", [chat_service_1.ChatService])
    ], ChatComponent);
    return ChatComponent;
}());
exports.ChatComponent = ChatComponent;
//# sourceMappingURL=chat.component.js.map