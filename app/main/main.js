"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var platform_browser_dynamic_1 = require("@angular/platform-browser-dynamic");
var app_module_1 = require("../modules/app/app.module");
core_1.enableProdMode();
platform_browser_dynamic_1.platformBrowserDynamic().bootstrapModule(app_module_1.AppModule, [
    {
        defaultEncapsulation: core_1.ViewEncapsulation.None
    }
]);
//# sourceMappingURL=main.js.map