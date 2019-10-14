const DAL = require('../../DAL');
const config = require('../../../config');
const generator = require('../../generator');
const sha512 = require('js-sha512');

const errorHandler = require('../../handlers/errorHandler');

const usersCollectionName = config.db.collections.users;

module.exports = {
    // Add user to the DB.
    async addUser(newUser) {
        if (await isEmailExists(newUser.email)) {
            return false;
        }

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

        let insertResult = await DAL.insert(usersCollectionName, newUserObj)
            .catch(errorHandler.promiseError);

        newUserObj._id = insertResult;

        return newUserObj;
    }
};

async function isEmailExists(email) {
    let userCount = await DAL.count(usersCollectionName, { email })
        .catch(errorHandler.promiseError);

    return !!userCount;
}

Date.prototype.addHours = function (h) {
    this.setTime(this.getTime() + (h * 60 * 60 * 1000));

    return this;
};