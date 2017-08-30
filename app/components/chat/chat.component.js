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
var chat_service_1 = require("../../services/chat/chat.service");
var ChatComponent = (function () {
    function ChatComponent(globalService, chatService) {
        this.globalService = globalService;
        this.chatService = chatService;
        this.messages = [];
        this.token = getToken();
        this.CloseChat = function () {
            this.chatData.isOpen = false;
        };
        this.SendMessage = function () {
            var msgData = {
                "from": this.chatData.user._id,
                "to": this.chatData.friend._id,
                "text": this.msghInput
            };
            this.msghInput = "";
            this.messages.push(msgData);
            this.socket.emit("SendMessage", msgData, this.token);
        };
        this.MsgInputKeyup = function (event) {
            if (event.code == "Enter") {
                this.SendMessage();
            }
        };
        this.globalService.data.subscribe(function (value) {
        });
    }
    ChatComponent.prototype.ngOnInit = function () {
        var self = this;
        this.socket = this.chatData.socket;
        this.socket.on('GetMessage', function (msgData) {
            self.messages.push(msgData);
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
        __metadata("design:paramtypes", [global_service_1.GlobalService, chat_service_1.ChatService])
    ], ChatComponent);
    return ChatComponent;
}());
exports.ChatComponent = ChatComponent;
//# sourceMappingURL=chat.component.js.map