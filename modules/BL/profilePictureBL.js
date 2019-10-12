const DAL = require('../DAL.js');
const config = require('../../config.js');

const profilePicturesCollectionName = config.db.collections.profilePictures;
const usersCollectionName = config.db.collections.users;

module.exports = {
    getUserProfileImage(profileId) {
        return new Promise((resolve, reject) => {
            if (!profileId) {
                resolve(null);
            }
            else {
                let profileObjectId = DAL.getObjectId(profileId);
                DAL.findOne(profilePicturesCollectionName, { "_id": profileObjectId }).then(resolve).catch(reject);
            }
        });
    },

    saveImage(imageData) {
        return new Promise((resolve, reject) => {
            let userIdObject = DAL.getObjectId(imageData.userId);

            let imageObj = {
                "image": imageData.imgBase64,
                "userId": userIdObject,
                "updateDate": new Date()
            };

            let deleteCurrentPicture = DAL.delete(profilePicturesCollectionName, { "userId": userIdObject });
            let insertImage = DAL.insert(profilePicturesCollectionName, imageObj);

            Promise.all([deleteCurrentPicture, insertImage]).then(results => {
                let imageId = results[1];
                let userProfile = { $set: { "profile": imageId } };

                // Update the id of the profile picture of the user.
                DAL.updateOne(usersCollectionName, { "_id": userIdObject }, userProfile).then(resolve);
            }).catch(reject);
        });
    },

    deleteImage(userId, profileId) {
        return new Promise((resolve, reject) => {
            let usersFilter = { "_id": DAL.getObjectId(userId) };
            let userObjectFieldDeleteQuery = { $unset: { "profile": 1 } };
            let profileFilter = { "_id": DAL.getObjectId(profileId) };

            let removeProfileImageFromUserObject =
                DAL.updateOne(usersCollectionName, usersFilter, userObjectFieldDeleteQuery);
            let removeProfileImage = DAL.delete(profilePicturesCollectionName, profileFilter);

            Promise.all([removeProfileImageFromUserObject, removeProfileImage]).then(results => {
                resolve(true);
            }).catch(reject)
        });
    }
};