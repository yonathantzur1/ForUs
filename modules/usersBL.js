var DAL = require('./DAL.js');

var generator = require('./generator.js');
var codeNumOfDigits = 6;
var codeNumOfHoursValid = 24;
var maxTryNum = 3;

module.exports = {

    // Return true if the user was found else false.
    GetUser: function (collectionName, user, sha512, callback) {
        var filter = { "email": user.email };

        DAL.GetDocsByFilter(collectionName, filter, function (result) {
            // In case of error or more then one user, return null.
            if (result == null || result.length > 1) {
                callback(null);
            }
            // In case the user was found.
            else if (result.length == 1) {
                // In case the password and salt hashing are the password hash in the db
                if (sha512(user.password + result[0].salt) == result[0].password) {
                    callback(result[0]);
                }
                // In case the password is incorrect.
                else {
                    callback(false);
                }
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
    AddUser: function (collectionName, newUser, sha512, callback) {
        var salt = generator.GenerateId(codeNumOfDigits);
        newUser.password = sha512(newUser.password + salt);

        // Creat the new user object.
        var newUserObj = {
            "name": newUser.name,
            "email": newUser.email,
            "password": newUser.password,
            "salt": salt
        };

        DAL.InsertDocument(collectionName, newUserObj, function (result) {
            callback(result);
        });
    },

    // Add reset password code to the DB and return the name of the user.
    AddResetCode: function (collectionName, email, callback) {
        var code = generator.GenerateId(codeNumOfDigits);

        var resetCode = { resetCode: { "code": code, "date": (new Date()).toISOString(), tryNum: 0, isUsed: false } };

        DAL.UpdateDocument(collectionName, email, resetCode, function (result) {
            callback(result);
        });
    },

    // Rest password of the user.
    ResetPassword: function (collectionName, forgotUser, sha512, callback) {
        var emailObj = { "email": forgotUser.email };
        var errorsObj = {
            emailNotFound: false,
            codeNotFound: false,
            codeNotValid: false,
            codeIsExpired: false,
            maxTry: false,
            codeIsUsed: false
        };

        DAL.GetDocsByFilter(collectionName, emailObj, function (result) {
            if (result == null || result.length > 1) {
                callback(null);
            }
            // In case the email was not found.
            else if (result.length == 0) {
                errorsObj.emailNotFound = true;
                callback(errorsObj);
            }
            // In case the code was not found.
            else if (!result[0].resetCode) {
                errorsObj.codeNotFound = true;
                callback(errorsObj);
            }
            // In case the code is used.
            else if (result[0].resetCode.isUsed) {
                errorsObj.codeIsUsed = true;
                callback(errorsObj);
            }
            // In case the code is in max try.
            else if (result[0].resetCode.tryNum >= maxTryNum) {
                errorsObj.maxTry = true;
                callback(errorsObj);
            }
            // In case the code is expired.
            else if (new Date(result[0].resetCode.date).addHours(codeNumOfHoursValid).getTime() <
                (new Date()).getTime()) {
                errorsObj.codeIsExpired = true;
                callback(errorsObj);
            }
            // In case the code is wrong.
            else if (result[0].resetCode.code != forgotUser.code) {
                errorsObj.codeNotValid = true;

                var updateCodeObj = { "resetCode": result[0].resetCode };
                updateCodeObj.resetCode.tryNum++;

                DAL.UpdateDocument(collectionName, emailObj, updateCodeObj, function (updateResult) {
                    if (updateResult != null && updateResult != false) {
                        callback(errorsObj);
                    }
                    else {
                        callback(updateResult);
                    }
                });
            }
            else {
                // Delete the reset code object and change the user password.
                var updateUser = result[0];
                updateUser.salt = generator.GenerateId(codeNumOfDigits);
                updateUser.password = sha512(forgotUser.newPassword + updateUser.salt);
                updateUser.resetCode.isUsed = true;                
                updateUser.resetCode.tryNum++;

                DAL.UpdateDocument(collectionName, emailObj, updateUser, function (updateResult) {
                    if (updateResult != null && updateResult != false) {
                        callback(true);
                    }
                    else {
                        callback(updateResult);
                    }
                });
            }
        });
    }

};

Date.prototype.addHours = function (h) {
    this.setTime(this.getTime() + (h * 60 * 60 * 1000));

    return this;
}