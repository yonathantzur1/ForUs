const DAL = require('../DAL');
const tokenHandler = require('../handlers/tokenHandler');
const mailer = require('../mailer');
const config = require('../../config');
const logger = require('../../logger');

const usersCollectionName = config.db.collections.users;
const profilePicturesCollectionName = config.db.collections.profilePictures;

const searchResultsLimit = 4;
const chatMailNotificationDelayTime = 1; // hours

module.exports = {
    getFriends(friendsIds) {
        return new Promise((resolve, reject) => {
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

            DAL.aggregate(usersCollectionName, aggregateArray).then((friends) => {
                friends && friends.forEach(friend => {
                    if (friend.profileImage) {
                        friend.profileImage = friend.profileImage.image;
                    }
                });

                resolve(friends);
            }).catch(reject);
        });
    },

    getMainSearchResults(searchInput, userId) {
        return new Promise((resolve, reject) => {
            let userObjectId = DAL.getObjectId(userId);
            searchInput = searchInput.replace(/\\/g, '').trim();

            // In case the input is empty, return empty result array.
            if (!searchInput) {
                return resolve([]);
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
                                { "friendRequests.send": userId }

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

            DAL.aggregate(usersCollectionName, aggregateArray).then((results) => {
                if (results) {
                    // Running on all results and order profiles structure to the next query
                    // for profile images.
                    results.forEach(result => {
                        result.originalProfile = result.profile;
                        result.profile = result.originalProfile ? -1 : false;
                    });

                    // Second sort for results by the search input string.
                    results = results.sort((a, b) => {
                        let aIndex = a.fullName.indexOf(searchInput);
                        let bIndex = b.fullName.indexOf(searchInput);

                        if (aIndex < bIndex) {
                            return -1;
                        }
                        else if (aIndex > bIndex) {
                            return 1;
                        }
                        else {
                            return 0;
                        }
                    });
                }

                resolve(results);
            }).catch(reject);
        });
    },

    getMainSearchResultsWithImages(profilesIds) {
        return new Promise((resolve, reject) => {
            if (profilesIds.length == 0) {
                resolve(profilesIds);
            }
            else {
                DAL.find(profilePicturesCollectionName, { "_id": { $in: convertIdsToObjectIds(profilesIds) } }).then((profiles) => {
                    if (!profiles) {
                        resolve(null);
                    }
                    else if (profiles.length > 0) {
                        let profilesDictionary = {};

                        profiles.forEach((profile) => {
                            profilesDictionary[profile._id] = profile.image;
                        });

                        resolve(profilesDictionary);
                    }
                    else {
                        resolve(profiles);
                    }
                }).catch(reject);
            }
        });
    },

    getUserMessagesNotifications(userId) {
        return DAL.findOneSpecific(usersCollectionName,
            { _id: DAL.getObjectId(userId) },
            { "messagesNotifications": 1 });
    },

    addMessageNotification(userId, friendId, msgId, senderName) {
        let friendIdObject = { "_id": DAL.getObjectId(friendId) };

        // Specific fields for friend query.
        let friendSelectFields = {
            email: 1,
            firstName: 1,
            messagesNotifications: 1
        };

        DAL.findOneSpecific(usersCollectionName, friendIdObject, friendSelectFields).then((friendObj) => {
            if (friendObj) {
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

                DAL.updateOne(usersCollectionName, friendIdObject, { $set: { "messagesNotifications": messagesNotifications } })
                    .catch(logger.error);
            }
        }).catch(logger.error);
    },

    updateMessagesNotifications(userId, messagesNotifications) {
        let userIdObject = {
            "_id": DAL.getObjectId(userId)
        };

        DAL.updateOne(usersCollectionName, userIdObject, { $set: { "messagesNotifications": messagesNotifications } })
            .catch(logger.error);
    },

    removeMessagesNotifications(userId, messagesNotifications) {
        let userIdObject = {
            "_id": DAL.getObjectId(userId)
        };

        DAL.updateOne(usersCollectionName, userIdObject, { $set: { "messagesNotifications": messagesNotifications } })
            .catch(logger.error);
    },

    getUserFriendRequests(userId) {
        return new Promise((resolve, reject) => {
            DAL.findOneSpecific(usersCollectionName,
                { _id: DAL.getObjectId(userId) },
                { "friendRequests": 1 }).then(resolve).catch(reject);
        });
    },

    addFriendRequest(user, friendId) {
        return new Promise((resolve, reject) => {
            // Validation check in order to check if the user and the friend are not already friends.
            if (user.friends.indexOf(friendId) != -1) {
                resolve(null);
            }
            else {
                let userIdObject = { "_id": DAL.getObjectId(user._id) };
                let friendIdObject = { "_id": DAL.getObjectId(friendId) };

                let addRequestToUser = DAL.updateOne(usersCollectionName,
                    userIdObject,
                    { $push: { "friendRequests.send": friendId } });
                let addRequestToFriend = DAL.updateOne(usersCollectionName,
                    friendIdObject,
                    { $push: { "friendRequests.get": user._id } });

                Promise.all([addRequestToUser, addRequestToFriend]).then(results => {
                    resolve(true);
                }).catch(reject);
            }
        });
    },

    removeFriendRequest(userId, friendId) {
        return new Promise((resolve, reject) => {
            let userIdObject = { "_id": DAL.getObjectId(userId) };
            let friendIdObject = { "_id": DAL.getObjectId(friendId) };

            let removeRequestFromUser = DAL.updateOne(usersCollectionName,
                userIdObject,
                { $pull: { "friendRequests.send": friendId } });
            let removeRequestFromFriend = DAL.updateOne(usersCollectionName,
                friendIdObject,
                { $pull: { "friendRequests.get": userId } });

            Promise.all([removeRequestFromUser, removeRequestFromFriend]).then(results => {
                resolve(true);
            }).catch(reject);
        });
    },

    // Remove the friend request from DB after the request confirmed.
    removeFriendRequestAfterConfirm(userId, friendId) {
        return new Promise((resolve, reject) => {
            let userObjectId = { "_id": DAL.getObjectId(userId) };
            let friendObjectId = { "_id": DAL.getObjectId(friendId) };

            let removeRequestFromUser = DAL.updateOne(usersCollectionName,
                userObjectId,
                {
                    $pull: { "friendRequests.send": friendId },
                    $push: { "friendRequests.accept": friendId }
                });

            let removeRequestFromFriend = DAL.updateOne(usersCollectionName,
                friendObjectId,
                { $pull: { "friendRequests.get": userId } });

            Promise.all([removeRequestFromUser, removeRequestFromFriend]).then(results => {
                resolve(true);
            }).catch(reject);
        });
    },

    // Remove the friend request from DB if the request was not confirmed.
    ignoreFriendRequest(userId, friendId) {
        return new Promise((resolve, reject) => {
            let userIdObject = { "_id": DAL.getObjectId(userId) };
            let friendIdObject = { "_id": DAL.getObjectId(friendId) };

            let removeRequestFromUser = DAL.updateOne(usersCollectionName,
                userIdObject,
                { $pull: { "friendRequests.get": friendId } });

            let removeRequestFromFriend = DAL.updateOne(usersCollectionName,
                friendIdObject,
                { $pull: { "friendRequests.send": userId } });

            Promise.all([removeRequestFromUser, removeRequestFromFriend]).then(results => {
                resolve(true);
            }).catch(reject);
        });
    },

    addFriend(user, friendId) {
        return new Promise((resolve, reject) => {
            // Check if the user and the friend are not already friends.
            if (user.friends.indexOf(friendId) != -1) {
                resolve(null);
                return;
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

            Promise.all(addFriendQueries).then(results => {
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

                resolve(finalResult);
            }).catch(reject);
        });
    },

    removeFriendRequestConfirmAlert(data) {
        return new Promise((resolve, reject) => {
            let userObjId = DAL.getObjectId(data.userId);
            let confirmedFriendsIds = data.confirmedFriendsIds;

            DAL.updateOne(usersCollectionName,
                { "_id": userObjId },
                { $pull: { "friendRequests.accept": { $in: confirmedFriendsIds } } }).then((result) => {
                    // Change result to true in case the update succeeded.
                    result && (result = true);
                    resolve(result)
                }).catch(reject);
        });
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