var jwt = require('jsonwebtoken');
var config = require('../modules/config.js');

module.exports = {
    GetTokenFromUserObject: function (user, req) {
        var tokenUserObject = {
            "_id": user._id,
            "firstName": user.firstName,
            "lastName": user.lastName,
            "email": user.email,
            "creationDate": user.creationDate,
            "profile": user.profile
        }

        var tokenObject = { "user": tokenUserObject };
        var token = jwt.sign(tokenObject, config.jwtSecret, config.jwtOptions);

        return token;
    }
}