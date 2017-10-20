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
var profilePicture_service_1 = require("../../services/profilePicture/profilePicture.service");
var ProfilePictureComponent = /** @class */ (function () {
    function ProfilePictureComponent(profilePictureService, globalService) {
        var _this = this;
        this.profilePictureService = profilePictureService;
        this.globalService = globalService;
        this.defaultProfileImage = "./app/components/profilePicture/pictures/empty-profile.png";
        this.isUserHasImage = null;
        this.isMobile = isTouchDevice;
        this.globalService.data.subscribe(function (value) {
            if (value["newUploadedImage"]) {
                globalService.userProfileImage = value["newUploadedImage"];
                _this.isUserHasImage = true;
            }
            if (value["isImageDeleted"]) {
                globalService.userProfileImage = _this.defaultProfileImage;
                _this.isUserHasImage = false;
                _this.globalService.setData("userImage", null);
            }
            if (value["userProfileImageLoaded"]) {
                if (_this.globalService.userProfileImage) {
                    _this.isUserHasImage = true;
                }
                else {
                    _this.isUserHasImage = false;
                }
            }
        });
    }
    ProfilePictureComponent.prototype.OpenEditWindow = function () {
        if (this.isEditEnable && this.isUserHasImage != null) {
            this.globalService.setData("isOpenProfileEditWindow", true);
        }
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], ProfilePictureComponent.prototype, "isEditEnable", void 0);
    ProfilePictureComponent = __decorate([
        core_1.Component({
            selector: 'profilePicture',
            templateUrl: './profilePicture.html',
            providers: [profilePicture_service_1.ProfilePictureService]
        }),
        __metadata("design:paramtypes", [profilePicture_service_1.ProfilePictureService, global_service_1.GlobalService])
    ], ProfilePictureComponent);
    return ProfilePictureComponent;
}());
exports.ProfilePictureComponent = ProfilePictureComponent;
//# sourceMappingURL=profilePicture.component.js.map