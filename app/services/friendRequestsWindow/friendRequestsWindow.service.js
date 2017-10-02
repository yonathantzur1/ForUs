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
var FriendRequestsWindowService = /** @class */ (function (_super) {
    __extends(FriendRequestsWindowService, _super);
    function FriendRequestsWindowService() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.prefix = "/api/friendRequestsWindow";
        return _this;
    }
    return FriendRequestsWindowService;
}(basic_service_1.BasicService));
exports.FriendRequestsWindowService = FriendRequestsWindowService;
//# sourceMappingURL=friendRequestsWindow.service.js.map