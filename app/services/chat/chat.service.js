"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var basic_service_1 = require("../basic/basic.service");
var ChatService = (function (_super) {
    __extends(ChatService, _super);
    function ChatService() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.prefix = "/api/chat";
        return _this;
    }
    ChatService.prototype.GetChat = function (idsArray, token) {
        var details = { "membersIds": idsArray, "token": token };
        return _super.prototype.post.call(this, this.prefix + '/getChat', JSON.stringify(details))
            .toPromise()
            .then(function (result) {
            return result.json();
        })
            .catch(function (result) {
            return null;
        });
    };
    return ChatService;
}(basic_service_1.BasicService));
exports.ChatService = ChatService;
//# sourceMappingURL=chat.service.js.map