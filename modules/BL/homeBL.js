const DAL = require('../DAL.js');
const config = require('../../config');

const collectionName = config.db.collections.users;

module.exports = {
    SaveUserLocation(userId, xCord, yCord) {
        return new Promise((resolve, reject) => {
            var findObj = { "_id": DAL.GetObjectId(userId) };
            var updateObj = {
                $unset: { "lastLocationErrorNumber": 1 },
                $set: {
                    "lastLocation": {
                        "type": "Point",
                        "coordinates": [xCord, yCord]
                    }
                }
            }

            DAL.UpdateOne(collectionName, findObj, updateObj).then(result => {
                resolve(result ? true : false);
            }).catch(reject);
        });
    },

    SaveUserLocationError(userId, error) {
        return new Promise((resolve, reject) => {
            var findObj = { "_id": DAL.GetObjectId(userId) };
            var updateObj = {
                $unset: { "lastLocation": 1 },
                $set: { "lastLocationErrorNumber": error }
            }

            DAL.UpdateOne(collectionName, findObj, updateObj).then(result => {
                resolve(result ? true : false);
            }).catch(reject);
        });
    }
};