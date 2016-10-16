module.exports = {
    GenerateId: function (numOfDigits) {
        var id = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < numOfDigits; i++)
            id += possible.charAt(Math.floor(Math.random() * possible.length));

        return id;
    }
};