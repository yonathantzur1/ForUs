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
var permissionsCard_service_1 = require("../../../../services/managementPanel/management/permissionsCard/permissionsCard.service");
var global_service_1 = require("../../../../services/global/global.service");
var event_service_1 = require("../../../../services/event/event.service");
var snackbar_service_1 = require("../../../../services/snackbar/snackbar.service");
var PermissionsCardComponent = /** @class */ (function () {
    function PermissionsCardComponent(globalService, eventService, snackbarService, permissionsCardService) {
        this.globalService = globalService;
        this.eventService = eventService;
        this.snackbarService = snackbarService;
        this.permissionsCardService = permissionsCardService;
        this.permissions = [];
        this.eventsIds = [];
        var self = this;
        //#region events
        eventService.Register("openPermissionsCard", function (user) {
            self.user = user;
            self.isLoading = true;
            permissionsCardService.GetUserPermissions(self.user._id).then(function (result) {
                self.isLoading = false;
                if (result) {
                    self.permissions.forEach(function (permission) {
                        if (result.indexOf(permission.type) != -1) {
                            permission.isChecked = true;
                        }
                        else {
                            permission.isChecked = false;
                        }
                    });
                }
            });
            $("#permissions-modal").modal('show');
        }, self.eventsIds);
        //#endregion
        self.isLoading = true;
        permissionsCardService.GetAllPermissions().then(function (result) {
            self.isLoading = false;
            if (result) {
                self.permissions = result;
            }
        });
    }
    PermissionsCardComponent.prototype.ngOnDestroy = function () {
        this.eventService.UnsubscribeEvents(this.eventsIds);
    };
    PermissionsCardComponent.prototype.CheckPermission = function (permission) {
        var currentState = permission.isChecked;
        this.permissions.forEach(function (perm) {
            perm.isChecked = false;
        });
        permission.isChecked = !currentState;
    };
    PermissionsCardComponent.prototype.UpdatePermissions = function () {
        var _this = this;
        this.isLoading = true;
        this.permissionsCardService.UpdatePermissions(this.user._id, this.permissions).then(function (result) {
            _this.isLoading = false;
            $("#permissions-modal").modal('hide');
            if (result) {
                _this.snackbarService.Snackbar("עדכון ההרשאות בוצע בהצלחה");
            }
            else {
                _this.snackbarService.Snackbar("שגיאה בעדכון ההרשאות");
            }
        });
    };
    PermissionsCardComponent = __decorate([
        core_1.Component({
            selector: 'permissionsCard',
            templateUrl: './permissionsCard.html',
            providers: [permissionsCard_service_1.PermissionsCardService],
            styleUrls: ['./permissionsCard.css']
        }),
        __metadata("design:paramtypes", [global_service_1.GlobalService,
            event_service_1.EventService,
            snackbar_service_1.SnackbarService,
            permissionsCard_service_1.PermissionsCardService])
    ], PermissionsCardComponent);
    return PermissionsCardComponent;
}());
exports.PermissionsCardComponent = PermissionsCardComponent;
//# sourceMappingURL=permissionsCard.component.js.map