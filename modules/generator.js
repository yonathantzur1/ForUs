module.exports = {
    GenerateCode: function (numOfDigits, isOnlyNumbers) {
        var code = "";
        var possible = isOnlyNumbers ? "0123456789" : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < numOfDigits; i++) {
            code += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return code;
    }
};