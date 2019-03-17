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
var event_service_1 = require("../../services/event/event.service");
var ProfilePictureComponent = /** @class */ (function () {
    function ProfilePictureComponent(globalService, eventService) {
        this.globalService = globalService;
        this.eventService = eventService;
        this.eventsIds = [];
    }
    ProfilePictureComponent.prototype.ngOnInit = function () {
        var self = this;
        //#region events
        self.eventService.Register("newUploadedImage", function (img) {
            self.globalService.userProfileImage = img;
            self.isUserHasImage = true;
        }, self.eventsIds);
        self.eventService.Register("deleteProfileImage", function () {
            self.globalService.userProfileImage = null;
            self.isUserHasImage = false;
        }, self.eventsIds);
        self.eventService.Register("userProfileImageLoaded", function () {
            self.isUserHasImage = self.globalService.userProfileImage ? true : false;
        }, self.eventsIds);
        self.eventService.Register("openProfileEditWindow", function () {
            self.OpenEditWindow();
        }, self.eventsIds);
        //#endregion
    };
    ProfilePictureComponent.prototype.ngOnDestroy = function () {
        this.eventService.UnsubscribeEvents(this.eventsIds);
    };
    ProfilePictureComponent.prototype.OpenEditWindow = function () {
        if (this.isEditEnable && this.isUserHasImage != null) {
            this.eventService.Emit("showProfileEditWindow", true);
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
            providers: [],
            styleUrls: ['./profilePicture.css']
        }),
        __metadata("design:paramtypes", [global_service_1.GlobalService,
            event_service_1.EventService])
    ], ProfilePictureComponent);
    return ProfilePictureComponent;
}());
exports.ProfilePictureComponent = ProfilePictureComponent;
//# sourceMappingURL=profilePicture.component.js.map