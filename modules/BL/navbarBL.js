const DAL = require('../DAL');
const mailer = require('../mailer');
const config = require('../../config');

const tokenHandler = require('../handlers/tokenHandler');
const errorHandler = require('../handlers/errorHandler');

const usersCollectionName = config.db.collections.users;
const profilePicturesCollectionName = config.db.collections.profilePictures;

const searchResultsLimit = 4;
const chatMailNotificationDelayTime = 1; // hours

module.exports = {
    async getFriends(friendsIds) {
        let friendsObjectIds = convertIdsToObjectIds(friendsIds);
        let friendsFilter = { $match: { "_id": { $in: friendsObjectIds } } };
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

        let concatFields = {
            $project: {
                "firstName": 1,
                "lastName": 1,
                "profileImage": 1,
                fullName: { $concat: ["$firstName", " ", "$lastName"] },
                fullNameReversed: { $concat: ["$lastName", " ", "$firstName"] }
            }
        };

        let sort = { $sort: { "fullName": 1, "fullNameReversed": 1 } };
        let friendsFileds = { $project: { "firstName": 1, "lastName": 1, "profileImage.image": 1 } };

        let aggregateArray = [
            friendsFilter,
            joinFilter,
            unwindObject,
            concatFields,
            sort,
            friendsFileds
        ];

        let friends = await DAL.aggregate(usersCollectionName, aggregateArray)
            .catch(errorHandler.promiseError);

        return friends.map(friend => {
            friend.profileImage && (friend.profileImage = friend.profileImage.image);

            return friend;
        });
    },

    async getMainSearchResults(searchInput, userId) {
        let userObjectId = DAL.getObjectId(userId);
        searchInput = searchInput.replace(/\\/g, '').trim();

        // In case the input is empty, return empty result array.
        if (!searchInput) {
            return [];
        }

        let projectFields = {
            $project: {
                "_id": 1,
                "profile": 1,
                "firstName": 1,
                "lastName": 1,
                "isPrivate": 1,
                "friends": 1,
                "friendRequests.send": 1,
                fullName: { $concat: ["$firstName", " ", "$lastName"] },
                fullNameReversed: { $concat: ["$lastName", " ", "$firstName"] }
            }
        };

        let usersFilter = {
            $match: {
                $and: [
                    {
                        $or: [
                            { fullName: new RegExp("^" + searchInput, 'g') },
                            { fullNameReversed: new RegExp("^" + searchInput, 'g') }
                        ]
                    },
                    {
                        $or: [
                            { "isPrivate": false },
                            { "_id": userObjectId },
                            { "friends": userObjectId },
                            { "friendRequests.send": userObjectId }

                        ]
                    }
                ]
            }
        };

        let userResultFields = {
            $project: {
                "_id": 1,
                "profile": 1,
                fullName: { $concat: ["$firstName", " ", "$lastName"] },
                fullNameReversed: { $concat: ["$lastName", " ", "$firstName"] }
            }
        };

        let sortObj = { $sort: { "fullName": 1, "fullNameReversed": 1 } };
        let limitObj = { $limit: searchResultsLimit };

        let aggregateArray = [projectFields, usersFilter, userResultFields, sortObj, limitObj];

        let results = await DAL.aggregate(usersCollectionName, aggregateArray)
            .catch(errorHandler.promiseError);

        // Running on all results and build profiles structure to the next query
        // for profile images.
        results.forEach(result => {
            result.originalProfile = result.profile;
            result.profile = result.originalProfile ? -1 : false;
        });

        // Second sort for results by the search input string.
        results = results.sort((a, b) => {
            let aIndex = a.fullName.indexOf(searchInput);
            let bIndex = b.fullName.indexOf(searchInput);

            return (aIndex < bIndex) ? -1 : 1;
        });

        return results;
    },

    async getMainSearchResultsWithImages(profilesIds) {
        if (profilesIds.length == 0) {
            return {};
        }

        let filter = { "_id": { $in: convertIdsToObjectIds(profilesIds) } };

        let profiles = await DAL.find(profilePicturesCollectionName, filter)
            .catch(errorHandler.promiseError);

        let profilesDictionary = {};

        profiles.forEach(profile => {
            profilesDictionary[profile._id] = profile.image;
        });

        return profilesDictionary;
    },

    getUserMessagesNotifications(userId) {
        return DAL.findOneSpecific(usersCollectionName,
            { _id: DAL.getObjectId(userId) },
            { "messagesNotifications": 1 });
    },

    async addMessageNotification(userId, friendId, msgId, senderName) {
        let friendIdObject = { "_id": DAL.getObjectId(friendId) };

        // Specific fields for friend query.
        let friendSelectFields = {
            email: 1,
            firstName: 1,
            messagesNotifications: 1
        };

        let friendObj = await DAL.findOneSpecific(usersCollectionName, friendIdObject, friendSelectFields)
            .catch(errorHandler.promiseError);

        if (!friendObj) {
            return errorHandler.promiseError("The user: " + friendId +
                " was found to add message notification");
        }

        let messagesNotifications = friendObj.messagesNotifications;

        // Send email in case no notification from the friend
        // exists or first notification is old.
        if (!messagesNotifications ||
            !messagesNotifications[userId] ||
            getDatesHoursDiff(new Date(), messagesNotifications[userId].lastUnreadMessageDate) >=
            chatMailNotificationDelayTime) {
            mailer.messageNotificationAlert(friendObj.email, friendObj.firstName, senderName);
        }

        let friendMessagesNotifications = messagesNotifications ? messagesNotifications[userId] : null;

        if (friendMessagesNotifications) {
            friendMessagesNotifications.unreadMessagesNumber++;
        }
        else {
            messagesNotifications = messagesNotifications || {};
            messagesNotifications[userId] = {
                "unreadMessagesNumber": 1,
                "firstUnreadMessageId": msgId
            }
        }

        // Adding the notification date to the notification object.
        messagesNotifications[userId].lastUnreadMessageDate = new Date();

        let updateObj = { $set: { "messagesNotifications": messagesNotifications } };

        await DAL.updateOne(usersCollectionName, friendIdObject, updateObj)
            .catch(errorHandler.promiseError);
    },

    async updateMessagesNotifications(userId, messagesNotifications) {
        let userIdObject = {
            "_id": DAL.getObjectId(userId)
        };

        let updateObj = { $set: { "messagesNotifications": messagesNotifications } };

        await DAL.updateOne(usersCollectionName, userIdObject, updateObj)
            .catch(errorHandler.promiseError);
    },

    async removeMessagesNotifications(userId, messagesNotifications) {
        let userIdObject = {
            "_id": DAL.getObjectId(userId)
        };

        let updateObj = { $set: { "messagesNotifications": messagesNotifications } };

        await DAL.updateOne(usersCollectionName, userIdObject, updateObj)
            .catch(errorHandler.promiseError);
    },

    getUserFriendRequests(userId) {
        return DAL.findOneSpecific(usersCollectionName,
            { _id: DAL.getObjectId(userId) },
            { "friendRequests": 1 });
    },

    async addFriendRequest(user, friendId) {
        // Check if the user and the friend are not already friends.
        if (user.friends.includes(friendId)) {
            return null;
        }

        let userObjId = DAL.getObjectId(user._id);
        let friendObjId = DAL.getObjectId(friendId);

        let addRequestToUser = DAL.updateOne(usersCollectionName,
            { "_id": userObjId },
            { $push: { "friendRequests.send": friendObjId } });
        let addRequestToFriend = DAL.updateOne(usersCollectionName,
            { "_id": friendObjId },
            { $push: { "friendRequests.get": userObjId } });

        await Promise.all([addRequestToUser, addRequestToFriend])
            .catch(errorHandler.promiseError);

        return true;
    },

    async removeFriendRequest(userId, friendId) {
        let userObjId = DAL.getObjectId(userId);
        let friendObjId = DAL.getObjectId(friendId);

        let removeRequestFromUser = DAL.updateOne(usersCollectionName,
            { "_id": userObjId },
            { $pull: { "friendRequests.send": friendObjId } });
        let removeRequestFromFriend = DAL.updateOne(usersCollectionName,
            { "_id": friendObjId },
            { $pull: { "friendRequests.get": userObjId } });

        await Promise.all([removeRequestFromUser, removeRequestFromFriend])
            .catch(errorHandler.promiseError);

        return true;
    },

    // Remove the friend request from DB after the request confirmed.
    async removeFriendRequestAfterConfirm(userId, friendId) {
        let userObjId = DAL.getObjectId(userId);
        let friendObjId = DAL.getObjectId(friendId);

        let removeRequestFromUser = DAL.updateOne(usersCollectionName,
            { "_id": userObjId },
            {
                $pull: { "friendRequests.send": friendObjId },
                $push: { "friendRequests.accept": friendObjId }
            });

        let removeRequestFromFriend = DAL.updateOne(usersCollectionName,
            { "_id": friendObjId },
            { $pull: { "friendRequests.get": userObjId } });

        await Promise.all([removeRequestFromUser, removeRequestFromFriend])
            .catch(errorHandler.promiseError);

        return true;
    },

    // Remove the friend request from DB if the request was not confirmed.
    async ignoreFriendRequest(userId, friendId) {
        let userObjId = DAL.getObjectId(userId);
        let friendObjId = DAL.getObjectId(friendId);

        let removeRequestFromUser = DAL.updateOne(usersCollectionName,
            { "_id": userObjId },
            { $pull: { "friendRequests.get": friendObjId } });

        let removeRequestFromFriend = DAL.updateOne(usersCollectionName,
            { "_id": friendObjId },
            { $pull: { "friendRequests.send": userObjId } });

        await Promise.all([removeRequestFromUser, removeRequestFromFriend])
            .catch(errorHandler.promiseError);

        return true;
    },

    async addFriend(user, friendId) {
        // Check if the user and the friend are not already friends.
        if (user.friends.includes(friendId)) {
            return null;
        }

        let userObjectId = DAL.getObjectId(user._id);
        let friendObjectId = DAL.getObjectId(friendId);

        let addUserFriendRelation = DAL.updateOne(usersCollectionName,
            { "_id": userObjectId },
            { $push: { "friends": friendObjectId } });

        let addFriendUserRelation = DAL.updateOne(usersCollectionName,
            { "_id": friendObjectId },
            { $push: { "friends": userObjectId } });

        let removeRequestObject = this.removeFriendRequestAfterConfirm(friendId, user._id);

        let getFriendProfileImage = DAL.findOneSpecific(profilePicturesCollectionName,
            { "userId": friendObjectId },
            { "image": 1 });

        let addFriendQueries = [
            addFriendUserRelation,
            addUserFriendRelation,
            removeRequestObject,
            getFriendProfileImage
        ];

        let results = await Promise.all(addFriendQueries)
            .catch(errorHandler.promiseError);

        let updatedFriend = results[0];
        let friendProfileImage = results[3];

        // Getting a new token from the user object with the friend.
        user.friends.push(friendId);
        let newToken = tokenHandler.getTokenFromUserObject(user);

        let clientFriendObject = {
            "_id": updatedFriend._id.toString(),
            "email": updatedFriend.email,
            "firstName": updatedFriend.firstName,
            "lastName": updatedFriend.lastName,
            "profileImage": friendProfileImage ? friendProfileImage.image : null
        };

        let finalResult = {
            "token": newToken,
            "friend": clientFriendObject
        };

        return finalResult;
    },

    async removeFriendRequestConfirmAlert(data) {
        let confirmedFriendsIds = data.confirmedFriendsIds.map(id => {
            return DAL.getObjectId(id);
        });

        let filter = { "_id": DAL.getObjectId(data.userId) }
        let updateObj = { $pull: { "friendRequests.accept": { $in: confirmedFriendsIds } } };

        let result = await DAL.updateOne(usersCollectionName, filter, updateObj)
            .catch(errorHandler.promiseError);

        return !!result;
    }
};

function convertIdsToObjectIds(array) {
    for (let i = 0; i < array.length; i++) {
        array[i] = DAL.getObjectId(array[i]);
    }

    return array;
}

function getDatesHoursDiff(date1, date2) {
    if (!date1 || !date2) {
        return -1;
    }
    else {
        return (Math.abs(date1 - date2) / 36e5);
    }
}