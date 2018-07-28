"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var InputFieldValidation = /** @class */ (function () {
    function InputFieldValidation() {
    }
    return InputFieldValidation;
}());
exports.InputFieldValidation = InputFieldValidation;
var MicrotextService = /** @class */ (function () {
    function MicrotextService() {
    }
    MicrotextService.prototype.Validation = function (validations, obj, regexp) {
        var regexpPatterns = {};
        // Convert strings to regex patterns in case regex was sent.
        if (regexp) {
            Object.keys(regexp).forEach(function (key) {
                regexpPatterns[key] = new RegExp(regexp[key], "i");
            });
        }
        var isValid = true;
        var checkedFieldsIds = [];
        // Running on all validation functions.
        for (var i = 0; i < validations.length; i++) {
            // In case the field was not invalid before.
            if (!this.IsInArray(checkedFieldsIds, validations[i].fieldId)) {
                // In case the field is not valid.
                if (!validations[i].isFieldValid(obj, regexpPatterns)) {
                    // In case the field is the first invalid field.
                    if (isValid) {
                        $("#" + validations[i].inputId).focus();
                    }
                    isValid = false;
                    // Push the field id to the array,
                    // so in the next validation of this field it will not be checked.
                    checkedFieldsIds.push(validations[i].fieldId);
                    // Show the microtext of the field. 
                    $("#" + validations[i].fieldId).html(validations[i].errMsg);
                }
                else {
                    // Clear the microtext of the field.
                    $("#" + validations[i].fieldId).html("");
                }
            }
        }
        checkedFieldsIds = [];
        return isValid;
    };
    // Check if object is in array.
    MicrotextService.prototype.IsInArray = function (array, value) {
        // Running on all the array.
        for (var i = 0; i < array.length; i++) {
            // In case the value is in the array.
            if (array[i] === value) {
                return true;
            }
        }
        return false;
    };
    // Hide microtext in a specific field.
    MicrotextService.prototype.ShowMicrotext = function (fieldId, text) {
        $("#" + fieldId).html(text);
    };
    // Hide microtext in a specific field.
    MicrotextService.prototype.HideMicrotext = function (fieldId) {
        $("#" + fieldId).html("");
    };
    return MicrotextService;
}());
exports.MicrotextService = MicrotextService;
//# sourceMappingURL=microtext.service.js.map