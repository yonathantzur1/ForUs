"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AlertType;
(function (AlertType) {
    AlertType[AlertType["CONFIRM"] = 0] = "CONFIRM";
    AlertType[AlertType["DANGER"] = 1] = "DANGER";
    AlertType[AlertType["WARNING"] = 2] = "WARNING";
})(AlertType = exports.AlertType || (exports.AlertType = {}));
var AlertService = /** @class */ (function () {
    function AlertService() {
        this.Initialize();
    }
    AlertService.prototype.Initialize = function () {
        this.isShow = false;
        this.isLoading = false;
        this.showCancelButton = true;
        this.confirmBtnText = "אישור";
        this.closeBtnText = "ביטול";
        this.title = null;
        this.text = null;
        this.type = null;
        this.preConfirm = null;
        this.confirmFunc = null;
        this.closeFunc = null;
        this.image = null;
    };
    AlertService.prototype.Alert = function (alertObject) {
        if (alertObject) {
            (alertObject.showCancelButton != null) && (this.showCancelButton = alertObject.showCancelButton);
            alertObject.title && (this.title = alertObject.title);
            alertObject.text && (this.text = alertObject.text);
            alertObject.preConfirm && (this.preConfirm = alertObject.preConfirm);
            alertObject.confirmFunc && (this.confirmFunc = alertObject.confirmFunc);
            alertObject.closeFunc && (this.closeFunc = alertObject.closeFunc);
            alertObject.confirmBtnText && (this.confirmBtnText = alertObject.confirmBtnText);
            alertObject.closeBtnText && (this.closeBtnText = alertObject.closeBtnText);
            alertObject.type && (this.type = alertObject.type);
            alertObject.image && (this.image = alertObject.image);
            this.isShow = true;
        }
    };
    AlertService.prototype.Confirm = function () {
        var _this = this;
        if (this.preConfirm) {
            this.isLoading = true;
            this.preConfirm().then(function () {
                _this.isLoading = true;
                _this.confirmFunc && _this.confirmFunc();
                _this.Initialize();
            });
        }
        else {
            this.confirmFunc && this.confirmFunc();
            this.Initialize();
        }
    };
    AlertService.prototype.Close = function () {
        this.closeFunc && this.closeFunc();
        this.Initialize();
    };
    return AlertService;
}());
exports.AlertService = AlertService;
//# sourceMappingURL=alert.service.js.map