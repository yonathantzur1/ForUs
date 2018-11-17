module.exports = {
    GenerateCode(numOfChars, isOnlyNumbers) {
        var code = "";
        var possible = isOnlyNumbers ? "0123456789" : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < numOfChars; i++) {
            code += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return code;
    },

    GenerateId() {
        var timestamp = (new Date().getTime() / 1000 | 0).toString(16);
        return timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, function () {
            return (Math.random() * 16 | 0).toString(16);
        }).toLowerCase();
    },

    SortArray(arr) {
        arr.sort((a, b) => {
            return (a < b) ? -1 : 1;
        });

        return arr;
    },

    // The function gets object-(json),
    // and path-(string of keys separated by . sign) of string inside the object.     
    // It converts the string to lower case letters.  
    LowerStringInObject(obj, path) {
        try {            
            eval("obj." + path + " = obj." + path + ".toLowerCase()");
        }
        catch (e) {
            // TODO: error log.
        }
    }
}