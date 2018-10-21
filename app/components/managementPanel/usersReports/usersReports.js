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
var usersReports_service_1 = require("../../../services/managementPanel/usersReports/usersReports.service");
var UsersReportsComponent = /** @class */ (function () {
    function UsersReportsComponent(usersReportsService) {
        this.usersReportsService = usersReportsService;
    }
    UsersReportsComponent.prototype.ngOnInit = function () {
        this.usersReportsService.GetAllReports().then(function (result) {
            var x = result;
        });
    };
    UsersReportsComponent = __decorate([
        core_1.Component({
            selector: 'usersReports',
            templateUrl: './usersReports.html',
            providers: [usersReports_service_1.UsersReportsService]
        }),
        __metadata("design:paramtypes", [usersReports_service_1.UsersReportsService])
    ], UsersReportsComponent);
    return UsersReportsComponent;
}());
exports.UsersReportsComponent = UsersReportsComponent;
//# sourceMappingURL=usersReports.js.map