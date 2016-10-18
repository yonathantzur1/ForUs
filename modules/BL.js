var DAL = require('./DAL.js');

var generator = require('./generator.js');
var codeNumOfDigits = 6;

module.exports = {

    // Return true if the user was found else false.
    ValidateUser: function (collectionName, user, callback) {
        var filter = { "email": user.email, 'password': user.password };

        DAL.GetDocsByFilter(collectionName, filter, function (result) {
            // In case of error or more then one user, return null.
            if (result == null || result.length > 1) {
                callback(null);
            }
            // In case the user was found.
            else if (result.length == 1) {
                callback(true);
            }
            // In case the user was not found.
            else {
                callback(false);
            }
        });
    },

    // Check if property is exists in DB.
    CheckIfUserExists: function (collectionName, email, callback) {
        DAL.GetDocsByFilter(collectionName, email, function (result) {
            // In case of error return null.
            if (result == null) {
                callback(null);
            }
            // In case user was not found.
            else if (result.length == 0) {
                callback(false);
            }
            // In case the user was found.
            else {
                callback(true);
            }
        });
    },

    // Add user to the DB.
    AddUser: function (collectionName, newUser, callback) {
        var newUserObj = { "name": newUser.name, "email": newUser.email, "password": newUser.password };
        DAL.InsertDocument(collectionName, newUserObj, function (result) {
            callback(result);
        });
    },

    // Adding reset password code to the DB and return the name of the user.
    AddResetCode: function (collectionName, email, callback) {
        var code = generator.GenerateId(codeNumOfDigits);

        DAL.UpdateDocument(collectionName, email, { "resetCode": code }, function (result) {
            callback(result);
        });
    },

    ResetPassword: function (collectionName, forgotUser, callback) {
        var emailObj = { "email": forgotUser.email };

        DAL.UpdateDocument(collectionName, emailObj, { "password": forgotUser.newPassword }, function (result) {
            callback(result);
        });
    }

};