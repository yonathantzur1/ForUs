"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SnackbarService = /** @class */ (function () {
    function SnackbarService() {
        this.Initialize();
    }
    SnackbarService.prototype.Initialize = function () {
        this.delay = 2500;
        this.isShow = false;
        this.text = "";
    };
    SnackbarService.prototype.Snackbar = function (text, delay) {
        var _this = this;
        // Clear timeout if exists.
        this.currentTimeout && clearTimeout(this.currentTimeout);
        // Set the text and show the snackbar.
        this.text = text;
        this.isShow = true;
        this.currentTimeout = setTimeout(function () {
            _this.isShow = false;
            _this.currentTimeout = null;
        }, delay || this.delay);
    };
    SnackbarService.prototype.HideSnackbar = function () {
        this.isShow = false;
    };
    return SnackbarService;
}());
exports.SnackbarService = SnackbarService;
//# sourceMappingURL=snackbar.service.js.map