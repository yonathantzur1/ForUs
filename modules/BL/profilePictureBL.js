const DAL = require('../DAL.js');
const config = require('../../config.js');

const collectionName = config.db.collections.profiles;
const usersCollectionName = config.db.collections.users;

module.exports = {
    GetUserProfileImage(profileId) {
        return new Promise((resolve, reject) => {
            if (!profileId) {
                resolve(null);
            }
            else {
                let profileObjectId = DAL.GetObjectId(profileId);
                DAL.FindOne(collectionName, { "_id": profileObjectId }).then(resolve).catch(reject);
            }
        });
    },

    SaveImage(imageData) {
        return new Promise((resolve, reject) => {
            let userIdObject = DAL.GetObjectId(imageData.userId);

            let imageObj = {
                "image": imageData.imgBase64,
                "userId": userIdObject,
                "updateDate": new Date()
            };

            let deleteCurrentPicture = DAL.Delete(collectionName, { "userId": userIdObject });
            let insertImage = DAL.Insert(collectionName, imageObj);

            Promise.all([deleteCurrentPicture, insertImage]).then(results => {
                let imageId = results[1];
                let userProfile = { $set: { "profile": imageId } };

                // Update the id of the profile picture of the user.
                DAL.UpdateOne(usersCollectionName, { "_id": userIdObject }, userProfile).then(resolve);
            }).catch(reject);
        });
    },

    DeleteImage(userId, profileId) {
        return new Promise((resolve, reject) => {
            let usersFilter = { "_id": DAL.GetObjectId(userId) };
            let userObjectFieldDeleteQuery = { $unset: { profile: "" } };
            let profileFilter = { "_id": DAL.GetObjectId(profileId) };

            let removeProfileImageFromUserObject =
                DAL.UpdateOne(usersCollectionName, usersFilter, userObjectFieldDeleteQuery);
            let removeProfileImage = DAL.Delete(collectionName, profileFilter);

            Promise.all([removeProfileImageFromUserObject, removeProfileImage]).then(results => {
                resolve(true);
            }).catch(reject)
        });
    }
}