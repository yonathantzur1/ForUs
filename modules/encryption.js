var crypto = require('crypto');
var config = require('../modules/config.js');

var algorithm = config.encryptAlgorithm;
var password = config.encryptSecret;

module.exports = {
    encrypt: function (text) {
        var cipher = crypto.createCipher(algorithm, password);
        var crypted = cipher.update(text, 'utf8', 'hex');
        crypted += cipher.final('hex');

        return crypted;
    },

    decrypt: function (text) {
        var decipher = crypto.createDecipher(algorithm, password);
        var dec = decipher.update(text, 'hex', 'utf8');
        dec += decipher.final('utf8');

        return dec;
    }
}