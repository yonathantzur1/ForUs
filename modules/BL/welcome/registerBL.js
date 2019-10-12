const DAL = require('../../DAL');
const config = require('../../../config');
const generator = require('../../generator');
const sha512 = require('js-sha512');

const usersCollectionName = config.db.collections.users;

module.exports = {
    // Check if user is exists on DB.
    checkIfUserExists(email) {
        return new Promise((resolve, reject) => {
            DAL.findOne(usersCollectionName, { email }).then((result) => {
                resolve(result ? true : false)
            }).catch(reject);
        });
    },

    // Add user to the DB.
    addUser(newUser) {
        return new Promise((resolve, reject) => {
            let salt = generator.generateCode(config.security.password.saltSize);
            newUser.password = sha512(newUser.password + salt);

            // Creat the new user object.
            let newUserObj = {
                "uid": generator.generateId(),
                "firstName": newUser.firstName,
                "lastName": newUser.lastName,
                "email": newUser.email,
                "password": newUser.password,
                "salt": salt,
                "creationDate": new Date(),
                "isPrivate": false,
                "friends": [],
                "friendRequests": {
                    "get": [],
                    "send": [],
                    "accept": []
                }
            };

            DAL.insert(usersCollectionName, newUserObj).then((result) => {
                if (result) {
                    newUserObj._id = result;
                    resolve(newUserObj);
                }
                else {
                    resolve(result);
                }
            }).catch(reject);
        });
    }
};

Date.prototype.addHours = function (h) {
    this.setTime(this.getTime() + (h * 60 * 60 * 1000));

    return this;
};