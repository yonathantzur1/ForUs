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
var management_service_1 = require("../../services/management/management.service");
var User = /** @class */ (function () {
    function User() {
    }
    return User;
}());
var ManagementComponent = /** @class */ (function () {
    function ManagementComponent(managementService) {
        this.managementService = managementService;
        this.Users = [];
    }
    ManagementComponent.prototype.SearchUser = function () {
        this.managementService.GetUserByName(this.searchInput).then(function (result) {
            var x = result;
        });
    };
    ManagementComponent = __decorate([
        core_1.Component({
            selector: 'management',
            templateUrl: './management.html',
            providers: [management_service_1.ManagementService]
        }),
        __metadata("design:paramtypes", [management_service_1.ManagementService])
    ], ManagementComponent);
    return ManagementComponent;
}());
exports.ManagementComponent = ManagementComponent;
//# sourceMappingURL=management.component.js.map