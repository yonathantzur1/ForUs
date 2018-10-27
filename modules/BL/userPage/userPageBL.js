const DAL = require('../../DAL');
const config = require('../../../config');

const managementBL = require('../../BL/managementPanel/managementBL');
const permissionsBL = require('../../BL/managementPanel/permissionsBL');
const permissionHandler = require('../../handlers/permissionHandler');

const usersCollectionName = config.db.collections.users;
const profilesCollectionName = config.db.collections.profiles;

var self = module.exports = {
    GetUserDetails(userId, currUserId) {
        return new Promise((resolve, reject) => {
            var isUserSelfPage = (userId == currUserId);
            var userObjectId = DAL.GetObjectId(userId);
            var userFilter = { $match: { "_id": userObjectId } };
            var joinFilter = {
                $lookup:
                {
                    from: profilesCollectionName,
                    localField: 'profile',
                    foreignField: '_id',
                    as: 'profileImage'
                }
            };
            var unwindObject = {
                $unwind: {
                    path: "$profileImage",
                    preserveNullAndEmptyArrays: true
                }
            };
            var userFileds = {
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
            isUserSelfPage && self.AddUserPersonalInfoToQueryObject(userFileds["$project"]);

            var aggregateArray = [userFilter, joinFilter, unwindObject, userFileds];

            // Find only users with profile picture.
            DAL.Aggregate(usersCollectionName, aggregateArray).then(user => {
                // In case the user found, extract it from the array.
                if (user && user.length == 1) {
                    var user = user[0];

                    // In case the user has profile image.
                    if (user.profileImage) {
                        user.profileImage = user.profileImage.image;
                    }

                    self.SetUsersRelation(user, currUserId);

                    // In case the user is not on his self page.
                    if (!isUserSelfPage) {
                        permissionsBL.GetUserPermissions(currUserId).then(userPermissions => {
                            if (permissionHandler.IsUserHasRootPermission(userPermissions)) {
                                user.isManagerView = true;
                            }

                            resolve(user);
                        }).catch(reject);
                    }
                    else {
                        resolve(user);
                    }
                }
                // In case the user doesn't exist. 
                else {
                    resolve(null);
                }
            }).catch(reject);
        });
    },

    // In case the user is in own page, return his personal information.
    AddUserPersonalInfoToQueryObject(obj) {
        obj["email"] = 1;
    },

    SetUsersRelation(user, currUserId) {
        // Boolean value that indicates if the current user is friend of the user.
        user.isFriend = (user.friends.indexOf(currUserId) != -1);

        // Boolean value that indicates if the current user sent friend request to the user.
        user.isGetFriendRequest = (user.friendRequests.get.indexOf(currUserId) != -1);

        // Boolean value that indicates if the current user got friend request from the user.
        user.isSendFriendRequest = (user.friendRequests.send.indexOf(currUserId) != -1);

        delete user.friendRequests;
    },

    RemoveFriends(userId, friendId) {
        return new Promise((resolve, reject) => {
            managementBL.RemoveFriends(userId, friendId).then(resolve).catch(reject);
        });
    }
}