const DAL = require('../DAL.js');
const config = require('../config.js');

const collectionName = config.db.collections.users;

module.exports = {
    RemoveRequestConfirmAlert: function (data, callback) {
        var userObjId = DAL.GetObjectId(data.userId);
        var confirmedFriendsIds = data.confirmedFriendsIds;
        var confirmedRequestsUnsetJson = {};

        DAL.UpdateOne(collectionName,
            { "_id": userObjId },
            { $pull: { "friendRequests.accept": { $in: confirmedFriendsIds } } },
            function (result) {
                // Change result to true in case the update succeeded.
                result && (result = true);
                callback(result)
            });
    }
}