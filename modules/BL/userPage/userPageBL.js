const DAL = require('../../DAL');
const config = require('../../../config');
const mailer = require('../../mailer');
const generator = require('../../generator');
const sha512 = require('js-sha512');

const permissionsBL = require('../../BL/managementPanel/permissionsBL');
const permissionHandler = require('../../handlers/permissionHandler');
const errorHandler = require('../../handlers/errorHandler');

const usersCollectionName = config.db.collections.users;
const chatsCollectionName = config.db.collections.chats;
const profilePicturesCollectionName = config.db.collections.profilePictures;

module.exports = {
    async getUserDetails(userId, currUserId) {
        let isUserSelfPage = (userId == currUserId);
        let userObjectId = DAL.getObjectId(userId);
        let currUserObjectId = DAL.getObjectId(currUserId);
        let userFilter = {
            $match: {
                $and: [
                    { "_id": userObjectId },
                    {
                        $or: [
                            { "isPrivate": false },
                            { "_id": currUserObjectId },
                            { "friends": currUserObjectId },
                            { "friendRequests.send": currUserId }
                        ]
                    }
                ]
            }
        };
        let joinFilter = {
            $lookup:
            {
                from: profilePicturesCollectionName,
                localField: 'profile',
                foreignField: '_id',
                as: 'profileImage'
            }
        };
        let unwindObject = {
            $unwind: {
                path: "$profileImage",
                preserveNullAndEmptyArrays: true
            }
        };
        let userFields = {
            $project: {
                "firstName": 1,
                "lastName": 1,
                "uid": 1,
                "friends": 1,
                "friendRequests": 1,
                "profileImage.image": 1
            }
        };

        // In case the user is in his self page.
        if (isUserSelfPage) {
            userFields.$project.email = 1;
        }

        let aggregateArray = [userFilter, joinFilter, unwindObject, userFields];

        // Build user details async queries.
        let getUserDetails = DAL.aggregate(usersCollectionName, aggregateArray);
        let userDetailsActions = [getUserDetails];
        !isUserSelfPage && (userDetailsActions.push(permissionsBL.getUserPermissions(currUserId)));

        let results = await Promise.all(userDetailsActions).catch(errorHandler.promiseError);

        let userResult = results[0];

        // In case the user doesn't exist.
        if (userResult.length == 0) {
            return null;
        }
        else {
            let user = userResult[0];
            user.profileImage && (user.profileImage = user.profileImage.image);
            this.setUsersRelation(user, currUserId);

            if (!isUserSelfPage) {
                let userPermissions = results[1];
                user.isManagerView = permissionHandler.isUserHasRootPermission(userPermissions);
            }

            return user;
        }
    },

    setUsersRelation(user, currUserId) {
        // Boolean value that indicates if the current user is friend of the user.
        user.isFriend = (user.friends.some(friendObjId => {
            return friendObjId.toString() == currUserId;
        }));

        // Boolean value that indicates if the current user sent friend request to the user.
        user.isGetFriendRequest = (user.friendRequests.get.indexOf(currUserId) != -1);

        // Boolean value that indicates if the current user got friend request from the user.
        user.isSendFriendRequest = (user.friendRequests.send.indexOf(currUserId) != -1);

        delete user.friends;
        delete user.friendRequests;
    },

    async removeFriends(userId, friendId) {
        let notificationsUnsetJson = {};
        notificationsUnsetJson["messagesNotifications." + userId] = 1;
        notificationsUnsetJson["messagesNotifications." + friendId] = 1;

        let removeFriendsChat = DAL.delete(chatsCollectionName,
            { "membersIds": { $all: [userId, friendId] } });

        let userObjectId = DAL.getObjectId(userId);
        let friendObjectId = DAL.getObjectId(friendId);

        let removeFriendsRelation = DAL.update(usersCollectionName,
            {
                $or: [
                    { "_id": userObjectId },
                    { "_id": friendObjectId }
                ]
            },
            {
                $pull: {
                    "friends": { $in: [userObjectId, friendObjectId] },
                    "friendRequests.get": { $in: [userId, friendId] },
                    "friendRequests.send": { $in: [userId, friendId] },
                    "friendRequests.accept": { $in: [userId, friendId] }
                },
                $unset: notificationsUnsetJson
            });

        await Promise.all([removeFriendsChat, removeFriendsRelation]).catch(errorHandler.promiseError);

        return true;
    },

    async deleteUserValidation(userId) {
        let deleteUser = {
            token: sha512(userId + generator.generateId()),
            date: new Date()
        };

        let updateObj = {
            $set: { deleteUser }
        };

        let deleteUserLink = config.address.site + "/delete/" + deleteUser.token;

        let user = await DAL.updateOne(usersCollectionName, { "_id": DAL.getObjectId(userId) }, updateObj)
            .catch(errorHandler.promiseError);

        mailer.validateDeleteUser(user.email, user.firstName, deleteUserLink);

        return true;
    }
};