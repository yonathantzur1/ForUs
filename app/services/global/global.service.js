"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("rxjs/add/operator/share");
require("rxjs/add/operator/startWith");
var BehaviorSubject_1 = require("rxjs/BehaviorSubject");
var GlobalService = /** @class */ (function () {
    function GlobalService() {
        // use this property for property binding
        this.data = new BehaviorSubject_1.BehaviorSubject({});
        this.socket = io();
    }
    GlobalService.prototype.ResetGlobalVariables = function () {
        this.socket && this.socket.destroy();
        this.socket = io();
        this.data = new BehaviorSubject_1.BehaviorSubject({});
        this.userProfileImage = null;
    };
    GlobalService.prototype.setData = function (key, value) {
        var currData = this.data.value;
        currData = {};
        currData[key] = value;
        this.data.next(currData);
    };
    GlobalService.prototype.setMultiData = function (array) {
        var currData = this.data.value;
        currData = {};
        array.forEach(function (element) {
            currData[element.key] = element.value;
        });
        this.data.next(currData);
    };
    return GlobalService;
}());
exports.GlobalService = GlobalService;
//# sourceMappingURL=global.service.js.map