var DAL = require('../DAL.js');

var collectionName = "Users";
var generator = require('../generator.js');
var resetCodeNumOfDigits = 8;
var resetCodeNumOfHoursValid = 24;
var maxTryNum = 3;

module.exports = {

    GetUserById: function (id, callback) {
        DAL.FindOne(collectionName, { _id: DAL.GetObjectId(id) }, function (result) {
            callback(result);
        });
    },

    // Return user object if the user was found else false.
    GetUser: function (user, sha512, callback) {
        var filter = { "email": user.email };

        DAL.Find(collectionName, filter, function (result) {
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
                callback("-1");
            }
        });
    },

    // Check if user is exists in DB.
    CheckIfUserExists: function (email, callback) {
        DAL.Find(collectionName, email, function (result) {
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
    AddUser: function (newUser, sha512, callback) {
        if (ValidateUserObject(newUser)) {
            var salt = generator.GenerateId(resetCodeNumOfDigits);
            newUser.password = sha512(newUser.password + salt);

            // Creat the new user object.
            var newUserObj = {
                "firstName": newUser.firstName,
                "lastName": newUser.lastName,
                "email": newUser.email,
                "password": newUser.password,
                "salt": salt,
                "creationDate": new Date(),
                "friends": []
            };

            DAL.Insert(collectionName, newUserObj, function (result) {
                if (result) {
                    newUserObj._id = result;
                    callback(newUserObj);
                }
                else {
                    callback(result);
                }
            });
        }
        else {
            callback(null);
        }
    },

    // Add reset password code to the DB and return the name of the user.
    AddResetCode: function (emailObj, callback) {
        var code = generator.GenerateId(resetCodeNumOfDigits);

        var resetCode = { $set: { resetCode: { "code": code, "date": new Date(), tryNum: 0, isUsed: false } } };

        DAL.UpdateOne(collectionName, emailObj, resetCode, function (result) {
            callback(result);
        });
    },

    // Rest password of the user.
    ResetPassword: function (forgotUser, sha512, callback) {
        var emailObj = { "email": forgotUser.email };
        var errorsObj = {
            emailNotFound: false,
            codeNotFound: false,
            codeNotValid: false,
            codeIsExpired: false,
            maxTry: false,
            codeIsUsed: false
        };

        DAL.Find(collectionName, emailObj, function (result) {
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
            else if (new Date(result[0].resetCode.date).addHours(resetCodeNumOfHoursValid).getTime() <
                (new Date()).getTime()) {
                errorsObj.codeIsExpired = true;
                callback(errorsObj);
            }
            // In case the code is wrong.
            else if (result[0].resetCode.code != forgotUser.code) {
                errorsObj.codeNotValid = true;
                var resetCodeObj = result[0].resetCode;
                resetCodeObj.tryNum++;

                var updateCodeObj = { $set: { "resetCode": resetCodeObj } };

                // Update num of tries to the code.
                DAL.UpdateOne(collectionName, emailObj, updateCodeObj, function (updateResult) {
                    if (updateResult != null && updateResult != false) {
                        callback(errorsObj);
                    }
                    else {
                        callback(updateResult);
                    }
                });
            }
            // In case the reset code is valid.
            else {
                // Change the user password.
                var updateUser = result[0];
                updateUser.salt = generator.GenerateId(resetCodeNumOfDigits);
                updateUser.password = sha512(forgotUser.newPassword + updateUser.salt);
                updateUser.resetCode.isUsed = true;
                updateUser.resetCode.tryNum++;

                updateUserObj = { $set: updateUser };

                DAL.UpdateOne(collectionName, emailObj, updateUserObj, function (updateResult) {
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

function ValidateUserObject(userObj) {
    if (typeof userObj.firstName == "string" &&
        typeof userObj.lastName == "string" &&
        typeof userObj.email == "string" &&
        typeof userObj.password == "string" &&
        userObj.firstName.length <= 10 &&
        userObj.lastName.length <= 10) {
        return true;
    }
    else {
        return false;
    }
}