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
        this.GetUnreadMessagesNumber = function () {
            var _this = this;
            var counter = 0;
            Object.keys(this.messagesNotifications).forEach(function (id) {
                counter += _this.messagesNotifications[id].unreadMessagesNumber;
            });
            return counter;
        };
    }
    UnreadWindowComponent.prototype.ngOnInit = function () {
        this.unreadWindowService.GetAllChats().then(function (chats) {
            var x = chats;
        });
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", Object)
    ], UnreadWindowComponent.prototype, "messagesNotifications", void 0);
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