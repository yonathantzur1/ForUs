const DAL = require('../DAL');
const config = require('../../config');
const events = require('../events');
const sha512 = require('js-sha512');

const usersCollectionName = config.db.collections.users;
const chatsCollectionName = config.db.collections.chats;
const profilesCollectionName = config.db.collections.profiles;
const permissionsCollectionName = config.db.collections.permissions;

const tokenTTL = config.security.deleteUser.tokenTTL;

module.exports = {

    ValidateDeleteUserToken(token) {
        return new Promise((resolve, reject) => {
            let query = {
                "deleteUser.token": token,
                "deleteUser.date": {
                    $gte: new Date().addHours(tokenTTL * -1)
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
                // In case the user was not found by token.
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

    DeleteUserFromDB(userId, userFirstName, userLastName) {
        return new Promise((resolve, reject) => {
            let userObjectId = DAL.GetObjectId(userId);
            let notificationsUnsetJson = {};
            notificationsUnsetJson["messagesNotifications." + userId] = 1;

            let findUserFriendsAndFriendRequests = DAL.FindOneSpecific(usersCollectionName,
                { "_id": userObjectId },
                { "friends": 1, "friendRequests.send": 1 });
            let removeUserPermissions = DAL.Update(permissionsCollectionName, {},
                { $pull: { "members": userObjectId } });
            let removeUserChats = DAL.Delete(chatsCollectionName, { "membersIds": userId });
            let removeUserFriendsRelations = DAL.Update(usersCollectionName, {},
                {
                    $pull: {
                        "friends": userObjectId,
                        "friendRequests.get": userId,
                        "friendRequests.send": userId,
                        "friendRequests.accept": userId
                    },
                    $unset: notificationsUnsetJson
                });
            let removeUserProfileImages = DAL.Delete(profilesCollectionName, { "userId": userObjectId });
            let removeUser = DAL.DeleteOne(usersCollectionName, { "_id": userObjectId });

            let deleteUserActions = [
                findUserFriendsAndFriendRequests,
                removeUserPermissions,
                removeUserChats,
                removeUserFriendsRelations,
                removeUserProfileImages,
                removeUser
            ];

            Promise.all(deleteUserActions).then(results => {
                resolve(true);

                // Get user friends ids array.
                let userFriendsRelations = results[0];
                let deletedUserFriends = userFriendsRelations.friends
                    .concat(userFriendsRelations.friendRequests.send);

                // In case the user has friends.
                if (deletedUserFriends.length > 0) {
                    // Send message to all user's friends.
                    events.emit('socket.RemoveFriendUser',
                    userId,
                    userFirstName + " " + userLastName,
                    deletedUserFriends);
                }
            }).catch(reject);
        });
    }
}