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
var permissionsCard_service_1 = require("../../../../services/management/permissionsCard/permissionsCard.service");
var global_service_1 = require("../../../../services/global/global.service");
var PermissionsCardComponent = /** @class */ (function () {
    function PermissionsCardComponent(globalService, permissionsCardService) {
        var _this = this;
        this.globalService = globalService;
        this.permissionsCardService = permissionsCardService;
        this.permissions = [];
        this.subscribeObj = this.globalService.data.subscribe(function (value) {
            if (value["isOpenPermissionsCard"]) {
                _this.user = value["isOpenPermissionsCard"];
                _this.isLoading = true;
                permissionsCardService.GetUserPermissions(_this.user._id).then(function (result) {
                    _this.isLoading = false;
                    if (result) {
                        _this.permissions.forEach(function (permission) {
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
            }
        });
        this.isLoading = true;
        permissionsCardService.GetAllPermissions().then(function (result) {
            _this.isLoading = false;
            if (result) {
                _this.permissions = result;
            }
        });
    }
    PermissionsCardComponent.prototype.ngOnDestroy = function () {
        this.subscribeObj.unsubscribe();
    };
    PermissionsCardComponent.prototype.UpdatePermissions = function () {
        var _this = this;
        this.isLoading = true;
        this.permissionsCardService.UpdatePermissions(this.user._id, this.permissions).then(function (result) {
            _this.isLoading = false;
            $("#permissions-modal").modal('hide');
            if (result) {
                snackbar("עדכון ההרשאות בוצע בהצלחה");
            }
            else {
                snackbar("שגיאה בעדכון ההרשאות");
            }
        });
    };
    PermissionsCardComponent = __decorate([
        core_1.Component({
            selector: 'permissionsCard',
            templateUrl: './permissionsCard.html',
            providers: [permissionsCard_service_1.PermissionsCardService]
        }),
        __metadata("design:paramtypes", [global_service_1.GlobalService,
            permissionsCard_service_1.PermissionsCardService])
    ], PermissionsCardComponent);
    return PermissionsCardComponent;
}());
exports.PermissionsCardComponent = PermissionsCardComponent;
//# sourceMappingURL=permissionsCard.component.js.map