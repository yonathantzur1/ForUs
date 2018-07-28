const DAL = require('../DAL.js');
const config = require('../../config.js');

const collectionName = config.db.collections.profiles;

module.exports = {
    GetUserProfileImage: (profileId) => {
        return new Promise((resolve, reject) => {
            if (!profileId) {
                resolve(null);
            }
            else {
                var profileObjectId = DAL.GetObjectId(profileId);
                DAL.FindOne(collectionName, { "_id": profileObjectId }).then(resolve).catch(reject);
            }
        });
    }
}