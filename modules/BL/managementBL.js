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
        var joinFilter = {
            $lookup:
                {
                    from: profileCollectionName,
                    localField: 'profile',
                    foreignField: '_id',
                    as: 'profileImage'
                }
        }
        var unwindObject = { $unwind: "$profileImage" };

        var aggregateArray = [
            {
                $project: {
                    fullName: { $concat: ["$firstName", " ", "$lastName"] },
                    fullNameReversed: { $concat: ["$lastName", " ", "$firstName"] },
                    "email": 1,
                    "profile": 1,
                    "creationDate": 1,
                    "lastLoginTime": 1
                }
            },
            usersFilter,
            joinFilter,
            unwindObject,
            {
                $sort: { "fullName": 1 }
            }
        ];

        DAL.Aggregate(usersCollectionName, aggregateArray, function (users) {
            callback(users);
        });
    }
};