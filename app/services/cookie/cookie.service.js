"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CookieService = /** @class */ (function () {
    function CookieService() {
    }
    CookieService.prototype.SetCookie = function (name, value, exHours) {
        var d = new Date();
        d.setTime(d.getTime() + (exHours * 60 * 60 * 1000));
        var expires = "expires=" + d.toUTCString();
        document.cookie = name + "=" + value + ";" + expires + ";path=/";
    };
    CookieService.prototype.GetCookie = function (name) {
        name += "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    };
    CookieService.prototype.DeleteCookieByName = function (name) {
        document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    };
    return CookieService;
}());
exports.CookieService = CookieService;
//# sourceMappingURL=cookie.service.js.map