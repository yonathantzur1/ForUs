const DAL = require('../DAL.js');
const config = require('../config.js');

const managementBL = require('../BL/managementBL');

const usersCollectionName = config.db.collections.users;
const profilesCollectionName = config.db.collections.profiles;

var self = module.exports = {
    GetUserDetails: (userId, currUserId) => {
        var data = { currUserId };

        return new Promise((resolve, reject) => {
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
            var unwindObject = { $unwind: "$profileImage" };
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

            var aggregateArray = [userFilter, joinFilter, unwindObject, userFileds];

            // Find only users with profile picture.
            DAL.Aggregate(usersCollectionName, aggregateArray).then(user => {
                // In case the user found, extract it from the array.
                if (user && user.length == 1) {
                    var user = user[0];
                    user.profileImage = user.profileImage.image;
                    self.SetUserData(user, data);
                    resolve(user);
                }
                else {
                    var queryFields = {
                        "firstName": 1,
                        "lastName": 1,
                        "uid": 1,
                        "friends": 1,
                        "friendRequests": 1
                    };

                    // In case no result to aggregate, try to find the user with find query
                    // because maby the user has no profile picture.
                    DAL.FindOneSpecific(usersCollectionName, { "_id": userObjectId }, queryFields)
                        .then(user => {
                            user && self.SetUserData(user, data);
                            resolve(user);
                        }).catch(reject);
                }
            }).catch(reject);
        });
    },

    SetUserData: (user, data) => {
        // Boolean value that indicates if the current user is friend of the user.
        user.isFriend = (user.friends.indexOf(data.currUserId) != -1);

        // Boolean value that indicates if the current user sent friend request to the user.
        user.isGetFriendRequest = (user.friendRequests.get.indexOf(data.currUserId) != -1);

        // Boolean value that indicates if the current user got friend request from the user.
        user.isSendFriendRequest = (user.friendRequests.send.indexOf(data.currUserId) != -1); 
        
        delete user.friendRequests;
    },

    RemoveFriends: (userId, friendId) => {
        return new Promise((resolve, reject) => {
            managementBL.RemoveFriends(userId, friendId).then(resolve).catch(reject);
        });
    }
}