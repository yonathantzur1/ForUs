const DAL = require('../DAL');
const config = require('../../config');
const sha512 = require('js-sha512');

const usersCollectionName = config.db.collections.users;
const chatsCollectionName = config.db.collections.chats;
const profilesCollectionName = config.db.collections.profiles;
const permissionsCollectionName = config.db.collections.permissions;

const tokenNumOfHoursValid = config.security.deleteUser.tokenNumOfHoursValid;

module.exports = {

    ValidateDeleteUserToken(token) {
        return new Promise((resolve, reject) => {
            let query = {
                "deleteUser.token": token,
                "deleteUser.date": {
                    $gte: new Date().addHours(tokenNumOfHoursValid * -1)
                }
            }

            let fields = { "_id": 0, "firstName": 1, "lastName": 1 };

            DAL.FindOneSpecific(usersCollectionName, query, fields).then(resolve).catch(reject);
        });
    },

    // Validating delete user account by token and password.
    IsAllowToDeleteAccount(data) {
        return new Promise((resolve, reject) => {
            let token = data.token;
            let password = data.password;

            let findObj = {
                "deleteUser.token": token
            };

            DAL.FindOne(usersCollectionName, findObj).then(user => {
                // In case the user were not found by token.
                if (!user) {
                    reject();
                }
                else {
                    // Return user object in case the entered password is equal to the user password.
                    resolve((user.password == sha512(password + user.salt)) ? user : false);
                }
            }).catch(reject);
        });
    },

    DeleteUserFromDB(userId) {
        return new Promise((resolve, reject) => {            
            let userObjectId = DAL.GetObjectId(userId);
            let notificationsUnsetJson = {};
            notificationsUnsetJson["messagesNotifications." + userId] = 1;

            let deletedUserFriends;

            // Getting deleted user friends.
            DAL.FindOneSpecific(usersCollectionName,
                { "_id": userObjectId },
                { "friends": 1, "friendRequests.send": 1 }).then((result) => {
                    if (result) {
                        deletedUserFriends = result.friends.concat(result.friendRequests.send);

                        // Remove all permissions of the user.
                        DAL.Update(permissionsCollectionName,
                            {}, // All permissions
                            { $pull: { "members": userObjectId } }).then((result) => {
                                // Remove all chats of the user.
                                DAL.Delete(chatsCollectionName,
                                    { "membersIds": userId }).then((result) => {
                                        // Remove user from all users friends list and message notifications.
                                        DAL.Update(usersCollectionName,
                                            {}, // All users
                                            {
                                                $pull: {
                                                    "friends": userId,
                                                    "friendRequests.get": userId,
                                                    "friendRequests.send": userId,
                                                    "friendRequests.accept": userId
                                                },
                                                $unset: notificationsUnsetJson
                                            }).then((result) => {
                                                // Remove all user profiles images.
                                                DAL.Delete(profilesCollectionName,
                                                    { "userId": userObjectId }).then((result) => {
                                                        // Remove the user object.
                                                        DAL.DeleteOne(usersCollectionName,
                                                            { "_id": userObjectId }).then((result) => {
                                                                // Return user friends ids in case the delete succeeded.
                                                                result && (result = deletedUserFriends);
                                                                resolve(result);
                                                            }).catch(reject);
                                                    }).catch(reject);
                                            }).catch(reject);
                                    }).catch(reject);
                            }).catch(reject);
                    }
                    else {
                        resolve(result);
                    }
                }).catch(reject);
        });
    }
}