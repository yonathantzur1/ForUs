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

            // Delete the current picture of the user.
            DAL.Delete(collectionName, { "userId": userIdObject }).then((count) => {
                // Insert the image to the collection of profile pictures.
                DAL.Insert(collectionName, imageObj).then((imageId) => {
                    let userProfile = { $set: { "profile": imageId } };

                    // Update the id of the profile picture of the user.
                    DAL.UpdateOne(usersCollectionName, { "_id": userIdObject }, userProfile)
                        .then(resolve).catch(reject);
                }).catch(reject);
            }).catch(reject);
        });
    },

    DeleteImage(userId, profileId) {
        return new Promise((resolve, reject) => {
            let usersFilter = { "_id": DAL.GetObjectId(userId) };
            let userObjectFieldDeleteQuery = { $unset: { profile: "" } };

            DAL.UpdateOne(usersCollectionName, usersFilter, userObjectFieldDeleteQuery).then((user) => {
                if (user) {
                    let profileFilter = { "_id": DAL.GetObjectId(profileId) };

                    DAL.Delete(collectionName, profileFilter).then((result) => {
                        if (result) {
                            resolve(user);
                        }
                        else {
                            resolve(null);
                        }
                    }).catch(reject);
                }
                else {
                    resolve(result);
                }
            }).catch(reject);
        });
    }
}