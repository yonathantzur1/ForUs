const DAL = require('../DAL.js');
const config = require('../../config.js');

const errorHandler = require('../handlers/errorHandler');

const profilePicturesCollectionName = config.db.collections.profilePictures;
const usersCollectionName = config.db.collections.users;

module.exports = {
    getUserProfileImage(profileId) {
        let profileObjectId = DAL.getObjectId(profileId);

        return DAL.findOne(profilePicturesCollectionName, { "_id": profileObjectId });
    },

    async saveImage(imageData) {
        let userObjId = DAL.getObjectId(imageData.userId);

        let imageObj = {
            "image": imageData.imgBase64,
            "userId": userObjId,
            "updateTime": new Date()
        };

        let deleteCurrentPicture = DAL.delete(profilePicturesCollectionName, { "userId": userObjId });
        let insertImage = DAL.insert(profilePicturesCollectionName, imageObj);

        let results = await Promise.all([deleteCurrentPicture, insertImage])
            .catch(errorHandler.promiseError);

        let imageId = results[1];
        let userProfile = { $set: { "profile": imageId } };

        // Update the id of the profile picture of the user.
        let updateResult = await DAL.updateOne(usersCollectionName, { "_id": userObjId }, userProfile)
            .catch(errorHandler.promiseError);

        return !!updateResult;
    },

    async deleteImage(userId, profileId) {
        let usersFilter = { "_id": DAL.getObjectId(userId) };
        let userObjectFieldDeleteQuery = { $unset: { "profile": 1 } };
        let profileFilter = { "_id": DAL.getObjectId(profileId) };

        let removeProfileImageFromUserObject =
            DAL.updateOne(usersCollectionName, usersFilter, userObjectFieldDeleteQuery);
        let removeProfileImage = DAL.delete(profilePicturesCollectionName, profileFilter);

        await Promise.all([removeProfileImageFromUserObject, removeProfileImage])
            .catch(errorHandler.promiseError);

        return true;
    }
};