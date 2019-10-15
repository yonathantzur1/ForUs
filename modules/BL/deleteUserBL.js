const DAL = require('../DAL');
const config = require('../../config');
const events = require('../events');
const logsBL = require('../BL/logsBL');
const sha512 = require('js-sha512');

const errorHandler = require('../handlers/errorHandler');

const usersCollectionName = config.db.collections.users;
const chatsCollectionName = config.db.collections.chats;
const profilePicturesCollectionName = config.db.collections.profilePictures;
const permissionsCollectionName = config.db.collections.permissions;

const tokenTTL = config.security.ttl.deleteUserToken;

module.exports = {
    validateDeleteUserToken(token) {
        let query = {
            "deleteUser.token": token,
            "deleteUser.date": {
                $gte: new Date().addHours(tokenTTL * -1)
            }
        };

        let fields = { "_id": 0, "firstName": 1, "lastName": 1 };

        return DAL.findOneSpecific(usersCollectionName, query, fields)
    },

    // Validating delete user account by token and password.
    async isAllowToDeleteAccount(data) {
        let token = data.token;
        let password = data.password;

        let findObj = {
            "deleteUser.token": token
        };

        let user = await DAL.findOne(usersCollectionName, findObj)
            .catch(errorHandler.promiseError);

        // In case the user was not found by token.
        if (!user) {
            return null;
        }

        // Return user object in case the entered password is equal to the user password.
        return (user.password == sha512(password + user.salt) ? user : false);
    },

    async deleteUserFromDB(userId, userFirstName, userLastName, userEmail, req) {
        let userObjectId = DAL.getObjectId(userId);
        let notificationsUnsetJson = {};
        notificationsUnsetJson["messagesNotifications." + userId] = 1;

        let findUserFriendsAndFriendRequests = DAL.findOneSpecific(usersCollectionName,
            { "_id": userObjectId },
            { "friends": 1, "friendRequests.send": 1 });
        let removeUserPermissions = DAL.update(permissionsCollectionName, {},
            { $pull: { "members": userObjectId } });
        let removeUserChats = DAL.delete(chatsCollectionName, { "membersIds": userId });
        let removeUserFriendsRelations = DAL.update(usersCollectionName, {},
            {
                $pull: {
                    "friends": userObjectId,
                    "friendRequests.get": userId,
                    "friendRequests.send": userId,
                    "friendRequests.accept": userId
                },
                $unset: notificationsUnsetJson
            });
        let removeUserProfileImages = DAL.delete(profilePicturesCollectionName, { "userId": userObjectId });
        let removeUser = DAL.deleteOne(usersCollectionName, { "_id": userObjectId });

        let deleteUserActions = [
            findUserFriendsAndFriendRequests,
            removeUserPermissions,
            removeUserChats,
            removeUserFriendsRelations,
            removeUserProfileImages,
            removeUser
        ];

        let results = await Promise.all(deleteUserActions)
            .catch(errorHandler.promiseError);

        logsBL.deleteUser(userEmail, req);

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

        return true;
    }
};