export class InputFieldValidation {
    isFieldValid: Function;
    errMsg: string;
    fieldId: string;
    inputId: string;
}

declare var $: any;

export class MicrotextService {

    Validation(validations: Array<InputFieldValidation>, obj: any, regexp?: any) {
        var regexpPatterns = {};
        // Convert strings to regex patterns in case regex was sent.
        if (regexp) {
            Object.keys(regexp).forEach((key: string) => {
                regexpPatterns[key] = new RegExp(regexp[key], "i");
            });
        }

        var isValid = true;
        var checkedFieldsIds: Array<any> = [];

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
    }

    // Check if object is in array.
    IsInArray(array: any[], value: any): boolean {
        // Running on all the array.
        for (var i = 0; i < array.length; i++) {
            // In case the value is in the array.
            if (array[i] === value) {
                return true;
            }
        }

        return false;
    }

    // Hide microtext in a specific field.
    ShowMicrotext(fieldId: string, text: string) {
        $("#" + fieldId).html(text);
    }

    // Hide microtext in a specific field.
    HideMicrotext(fieldId: string) {
        $("#" + fieldId).html("");
    }

}