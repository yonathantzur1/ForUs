const DAL = require('../../DAL');
const config = require('../../../config');

const collectionName = config.db.collections.users;

module.exports = {
    RemoveRequestConfirmAlert(data) {
        return new Promise((resolve, reject) => {
            var userObjId = DAL.GetObjectId(data.userId);
            var confirmedFriendsIds = data.confirmedFriendsIds;
            var confirmedRequestsUnsetJson = {};

            DAL.UpdateOne(collectionName,
                { "_id": userObjId },
                { $pull: { "friendRequests.accept": { $in: confirmedFriendsIds } } }).then((result) => {
                    // Change result to true in case the update succeeded.
                    result && (result = true);
                    resolve(result)
                }).catch(reject);
        });
    }
}