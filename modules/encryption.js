const crypto = require('crypto');
const config = require('./config.js');

const algorithm = config.encrypt.algorithm;
const password = config.encrypt.secret;

module.exports = {
    encrypt: function (text) {
        try {
            var cipher = crypto.createCipher(algorithm, password);
            var crypted = cipher.update(text, 'utf8', 'hex');
            crypted += cipher.final('hex');

            return crypted;
        }
        catch (err) {
            return null;
        }

    },

    decrypt: function (text) {
        try {
            var decipher = crypto.createDecipher(algorithm, password);
            var dec = decipher.update(text, 'hex', 'utf8');
            dec += decipher.final('utf8');

            return dec;
        }
        catch (err) {
            return null;
        }
    }
}