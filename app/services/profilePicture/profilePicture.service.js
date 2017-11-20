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
var ProfilePictureService = /** @class */ (function (_super) {
    __extends(ProfilePictureService, _super);
    function ProfilePictureService() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.prefix = "/api/profilePicture";
        return _this;
    }
    ProfilePictureService.prototype.GetUserProfileImage = function () {
        return _super.prototype.get.call(this, this.prefix + '/getUserProfileImage')
            .toPromise()
            .then(function (result) {
            return result;
        })
            .catch(function (result) {
            return null;
        });
    };
    return ProfilePictureService;
}(basic_service_1.BasicService));
exports.ProfilePictureService = ProfilePictureService;
//# sourceMappingURL=profilePicture.service.js.map