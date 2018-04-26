const DAL = require('../DAL.js');
const config = require('../config.js');

const usersCollectionName = config.db.collections.users;
const profilesCollectionName = config.db.collections.profiles;

module.exports = {
    GetUserDetails: (userId) => {
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
            var userFileds = { $project: { "firstName": 1, "lastName": 1, "uid": 1, "profileImage.image": 1 } };

            var aggregateArray = [userFilter, joinFilter, unwindObject, userFileds];

            // Find only users with profile picture.
            DAL.Aggregate(usersCollectionName, aggregateArray).then(user => {
                // In case the user found, extract it from the array.
                if (user && user.length == 1) {
                    resolve(user[0]);
                }
                else {
                    var queryFields = { "firstName": 1, "lastName": 1, "uid": 1 };

                    // In case no result to aggregate, try to find the user with find query
                    // because maby the user has no profile picture.
                    DAL.FindOneSpecific(usersCollectionName, { "_id": userObjectId }, queryFields)
                        .then(resolve).catch(reject);
                }
            }).catch(reject);
        });
    }
}