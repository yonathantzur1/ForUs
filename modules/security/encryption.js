const crypto = require('crypto');
const config = require('../../config.js');

const algorithm = config.security.encrypt.algorithm;
const password = config.security.encrypt.secret;

module.exports = {
    encrypt: function (text, key) {
        try {
            var cipher = crypto.createCipher(algorithm, key || password);
            var crypted = cipher.update(text, 'utf8', 'hex');
            crypted += cipher.final('hex');

            return crypted;
        }
        catch (err) {
            return null;
        }

    },

    decrypt: function (text, key) {
        try {
            var decipher = crypto.createDecipher(algorithm, key || password);
            var dec = decipher.update(text, 'hex', 'utf8');
            dec += decipher.final('utf8');

            return dec;
        }
        catch (err) {
            return null;
        }
    }
}