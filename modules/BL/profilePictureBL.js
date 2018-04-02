const DAL = require('../DAL.js');
const config = require('../config.js');

const collectionName = config.db.collections.profiles;

module.exports = {
    GetUserProfileImage: function (profileId, callback) {
        if (!profileId) {
            callback(null);
        }
        else {
            var profileObjectId = DAL.GetObjectId(profileId);

            DAL.FindOne(collectionName, { "_id": profileObjectId }, function (result) {
                callback(result);
            });
        }
    }
}