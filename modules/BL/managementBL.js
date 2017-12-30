var DAL = require('../DAL.js');

var usersCollectionName = "Users";
var profileCollectionName = "Profiles";

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
        var $lookup = {
            from: profileCollectionName,
            localField: 'profile',
            foreignField: '_id',
            as: 'profileImage'
        }

        var aggregateArray = [
            {
                $project: {
                    fullName: { $concat: ["$firstName", " ", "$lastName"] },
                    fullNameReversed: { $concat: ["$lastName", " ", "$firstName"] },
                    "firstName": 1,
                    "lastName": 1,
                    "email": 1,
                    "profile": 1,
                    "creationDate": 1,
                    "lastLoginTime": 1
                }
            },
            usersFilter,
            { $lookup },
            { $unwind: "$profileImage" },
            {
                $project: {
                    // Should be here and on $project above because how aggregate works.
                    "firstName": 1,
                    "lastName": 1,
                    "email": 1,
                    "creationDate": 1,
                    "lastLoginTime": 1,

                    // Taking only specific fields from the document.
                    "profileImage.image": 1,
                    "profileImage.updateDate": 1
                }
            },
            {
                $sort: { "fullName": 1 }
            }
        ];

        DAL.Aggregate(usersCollectionName, aggregateArray, function (users) {
            callback(users);
        });
    }
};