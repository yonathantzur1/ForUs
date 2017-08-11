"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var basic_service_1 = require("../basic/basic.service");
var ProfileService = (function (_super) {
    __extends(ProfileService, _super);
    function ProfileService() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.prefix = "/api/profile";
        return _this;
    }
    ProfileService.prototype.SaveImage = function (imgBase64) {
        var image = {
            "imgBase64": imgBase64
        };
        return _super.prototype.post.call(this, this.prefix + '/saveImage', JSON.stringify(image))
            .toPromise()
            .then(function (result) {
            return result.json();
        })
            .catch(function (result) {
            return null;
        });
    };
    ProfileService.prototype.DeleteImage = function () {
        return _super.prototype.delete.call(this, this.prefix + '/deleteImage')
            .toPromise()
            .then(function (result) {
            return result.json();
        })
            .catch(function (result) {
            return null;
        });
    };
    return ProfileService;
}(basic_service_1.BasicService));
exports.ProfileService = ProfileService;
//# sourceMappingURL=profile.service.js.map