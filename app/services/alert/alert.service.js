"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ALERT_TYPE;
(function (ALERT_TYPE) {
    ALERT_TYPE[ALERT_TYPE["INFO"] = 0] = "INFO";
    ALERT_TYPE[ALERT_TYPE["DANGER"] = 1] = "DANGER";
    ALERT_TYPE[ALERT_TYPE["WARNING"] = 2] = "WARNING";
})(ALERT_TYPE = exports.ALERT_TYPE || (exports.ALERT_TYPE = {}));
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
    };
    AlertService.prototype.Alert = function (alertObject) {
        if (alertObject) {
            (alertObject.showCancelButton != null) && (this.showCancelButton = alertObject.showCancelButton);
            this.title = alertObject.title;
            ;
            this.text = alertObject.text;
            this.preConfirm = alertObject.preConfirm;
            this.confirmFunc = alertObject.confirmFunc;
            this.closeFunc = alertObject.closeFunc;
            this.finalFunc = alertObject.finalFunc;
            (alertObject.confirmBtnText != null) && (this.confirmBtnText = alertObject.confirmBtnText);
            (alertObject.closeBtnText != null) && (this.closeBtnText = alertObject.closeBtnText);
            this.type = alertObject.type;
            this.image = alertObject.image;
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
            this.ActivateAlertClose();
        }
    };
    AlertService.prototype.Close = function () {
        this.closeFunc && this.closeFunc();
        this.ActivateAlertClose();
    };
    AlertService.prototype.ActivateAlertClose = function () {
        this.finalFunc && this.finalFunc();
        this.Initialize();
    };
    return AlertService;
}());
exports.AlertService = AlertService;
//# sourceMappingURL=alert.service.js.map