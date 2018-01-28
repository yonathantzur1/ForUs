"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var SortObjects = /** @class */ (function () {
    function SortObjects() {
    }
    SortObjects.prototype.transform = function (arr, property) {
        return arr.sort(function (a, b) {
            var aValue = property ? a[property] : a;
            var bValue = property ? b[property] : b;
            if (aValue < bValue) {
                return -1;
            }
            else if (aValue > bValue) {
                return 1;
            }
            else {
                return 0;
            }
        });
        ;
    };
    SortObjects = __decorate([
        core_1.Pipe({ name: 'sortObjects' })
    ], SortObjects);
    return SortObjects;
}());
exports.SortObjects = SortObjects;
//# sourceMappingURL=sort.pipe.js.map