const DAL = require('../DAL.js');

const collectionName = "Profiles";

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