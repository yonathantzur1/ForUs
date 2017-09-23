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
    GlobalService.prototype.GenerateNewSocket = function () {
        this.socket ? this.socket.destroy() : null;
        this.socket = io();
    };
    GlobalService.prototype.setData = function (key, value) {
        var currData = this.data.value;
        currData[key] = value;
        this.data.next(currData);
    };
    GlobalService.prototype.setMultiData = function (array) {
        var currData = this.data.value;
        array.forEach(function (element) {
            currData[element.key] = element.value;
        });
        this.data.next(currData);
    };
    GlobalService.prototype.deleteData = function (key) {
        var currData = this.data.value;
        delete currData[key];
    };
    GlobalService.prototype.deleteMultiData = function (array) {
        if (array.length != 0) {
            var currData = this.data.value;
            array.forEach(function (key) {
                delete currData[key];
            });
        }
    };
    return GlobalService;
}());
exports.GlobalService = GlobalService;
//# sourceMappingURL=global.service.js.map