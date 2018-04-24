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
            var userFileds = { $project: { "firstName": 1, "lastName": 1, "profileImage.image": 1 } };

            var aggregateArray = [userFilter, joinFilter, unwindObject, userFileds];

            DAL.Aggregate(usersCollectionName, aggregateArray).then(user => {
                // In case the user found, extract it from the array.
                if (user) {
                    resolve(user[0]);
                }
                else {
                    resolve(user);
                }
            }).catch(reject);
        });
    }
}