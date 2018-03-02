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
var alert_service_1 = require("../../services/alert/alert.service");
var AlertComponent = /** @class */ (function () {
    function AlertComponent(alertService) {
        this.alertService = alertService;
        this.alertType = alert_service_1.AlertType;
    }
    AlertComponent.prototype.ConfirmClick = function () {
        !this.alertService.isLoading && this.alertService.Confirm();
    };
    AlertComponent.prototype.CloseClick = function () {
        !this.alertService.isLoading && this.alertService.Close();
    };
    AlertComponent.prototype.KeyPress = function (event) {
        // In case of pressing escape.
        if (event.keyCode == 27) {
            this.CloseClick();
        }
    };
    __decorate([
        core_1.HostListener('document:keyup', ['$event']),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", void 0)
    ], AlertComponent.prototype, "KeyPress", null);
    AlertComponent = __decorate([
        core_1.Component({
            selector: 'alert',
            templateUrl: './alert.html',
            providers: []
        }),
        __metadata("design:paramtypes", [alert_service_1.AlertService])
    ], AlertComponent);
    return AlertComponent;
}());
exports.AlertComponent = AlertComponent;
//# sourceMappingURL=alert.component.js.map