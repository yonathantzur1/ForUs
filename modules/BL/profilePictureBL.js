var DAL = require('../DAL.js');

var collectionName = "Profiles";

module.exports = {
    GetUserProfileImage: function (profileId, callback) {
        if (!profileId) {
            callback(null);
        }
        else {
            var profileObjectId = DAL.GetObjectId(profileId);

            DAL.Find(collectionName, { "_id": profileObjectId }, function (result) {
                // In case of error or the picture was not found.
                if (result == null || result.length == 0) {
                    callback(null);
                }
                else {
                    callback(result[0]);
                }
            });
        }
    }
}