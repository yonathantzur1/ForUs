const DAL = require('../DAL.js');
const config = require('../config');
const general = require('../general');
const generator = require('../generator');
const sha512 = require('js-sha512');

const usersCollectionName = "Users";
const profileCollectionName = "Profiles";

module.exports = {
    GetUserByName: function (searchInput, callback) {
        var usersFilter = {
            $match: {
                $or: [
                    { fullName: new RegExp("^" + searchInput, 'g') },
                    { fullNameReversed: new RegExp("^" + searchInput, 'g') }
                ]
            }
        };

        var joinFilter = {
            $lookup: {
                from: profileCollectionName,
                localField: 'profile',
                foreignField: '_id',
                as: 'profileImage'
            }
        }

        var aggregateArray = [
            {
                $project: {
                    fullName: { $concat: ["$firstName", " ", "$lastName"] },
                    fullNameReversed: { $concat: ["$lastName", " ", "$firstName"] },
                    friendsNumber: { $size: "$friends" },
                    "firstName": 1,
                    "lastName": 1,
                    "email": 1,
                    "profile": 1,
                    "creationDate": 1,
                    "lastLoginTime": 1,
                    "friends": 1
                }
            },
            usersFilter,
            joinFilter,
            {
                $project: {
                    // Should be here and on $project above because how aggregate works.
                    "firstName": 1,
                    "lastName": 1,
                    "fullName": 1,
                    "fullNameReversed": 1,
                    "email": 1,
                    "creationDate": 1,
                    "lastLoginTime": 1,
                    "friendsNumber": 1,
                    "friends": 1,

                    // Taking only specific fields from the document.
                    "profileImage.image": 1,
                    "profileImage.updateDate": 1
                }
            },
            {
                $sort: { "fullName": 1, "fullNameReversed": 1 }
            }
        ];

        DAL.Aggregate(usersCollectionName, aggregateArray, function (users) {
            // In case of error.
            if (!users) {
                callback(null);
            }
            else {
                users = users.sort((a, b) => {
                    var aIndex = a.fullName.indexOf(searchInput);
                    var bIndex = b.fullName.indexOf(searchInput);

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

                users = users.map(user => {
                    user.profileImage = (user.profileImage.length != 0) ? user.profileImage[0] : null;

                    return user;
                });

                callback(users);
            }
        });
    },

    GetUserFriends: function (friendsIds, callback) {
        friendsIds = friendsIds.map((id) => {
            return DAL.GetObjectId(id);
        });

        var usersFilter = {
            $match: { "_id": { $in: friendsIds } }
        };

        var joinFilter = {
            $lookup: {
                from: profileCollectionName,
                localField: 'profile',
                foreignField: '_id',
                as: 'profileImage'
            }
        }

        var aggregateArray = [
            usersFilter,
            joinFilter,
            {
                $project: {
                    fullName: { $concat: ["$firstName", " ", "$lastName"] },
                    fullNameReversed: { $concat: ["$lastName", " ", "$firstName"] },
                    "profileImage.image": 1
                }
            },
            {
                $sort: { "fullName": 1, "fullNameReversed": 1 }
            }
        ];

        DAL.Aggregate(usersCollectionName, aggregateArray, function (friends) {
            // In case of error.
            if (!friends) {
                callback(null);
            }
            else {
                friends = friends.map(friend => {
                    friend.profileImage = (friend.profileImage.length != 0) ? friend.profileImage[0].image : null;

                    return friend;
                });

                callback(friends);
            }
        });
    },

    UpdateUser: function (updateFields, callback) {
        var userId = updateFields._id;
        delete updateFields._id;

        // Generate password hash and salt.
        if (updateFields.password) {
            updateFields.uid = general.GenerateId();
            updateFields.salt = generator.GenerateCode(config.loginSecure.saltNumOfDigits);
            updateFields.password = sha512(updateFields.password + updateFields.salt);
        }

        DAL.UpdateOne(usersCollectionName,
            { "_id": DAL.GetObjectId(userId) },
            { $set: updateFields },
            function (result) {
                callback(result);
            });
    }
};