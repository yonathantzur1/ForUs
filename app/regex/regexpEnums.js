"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var UserRegexp;
(function (UserRegexp) {
    UserRegexp["name"] = "^([\u05D0-\u05EA]{1}[-'`]{0,1}[\u05D0-\u05EA]{1,}[-'`]{0,1}[\u05D0-\u05EA]{0,}){1,}([ ]+([\u05D0-\u05EA]{1}[-'`]{0,1}[\u05D0-\u05EA]{1,}[-'`]{0,1}[\u05D0-\u05EA]{0,}){1,})*$";
    UserRegexp["email"] = "^[-a-z0-9~!$%^&*_=+}{'?]+(.[-a-z0-9~!$%^&*_=+}{'?]+)*@([a-z0-9_][-a-z0-9_]*(.[-a-z0-9_]+)*.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}))(:[0-9]{1,5})?$";
})(UserRegexp = exports.UserRegexp || (exports.UserRegexp = {}));
//# sourceMappingURL=regexpEnums.js.map