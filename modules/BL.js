var DAL = require('./DAL.js');

module.exports = {

    // Return true if the user was found else false.
    ValidateUser: function (collectionName, filter, callback) {
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
    AddUser: function (collectionName, user, callback) {
        DAL.InsertDocument(collectionName, user, function (result) {
            // In case of error.
            if (result == null) {
                callback(null);
            }
            else {
                callback(result);
            }
        });
    },

    // Adding reset password code to the DB and return the name of the user.
    AddResetCode: function (collectionName, email, callback) {
        DAL.AddResetCode(collectionName, email, function(result) {
            callback(result);
        });
    }

};