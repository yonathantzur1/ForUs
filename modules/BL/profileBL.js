const DAL = require('../DAL.js');
const config = require('../config.js');

const collectionName = config.db.collections.profiles;
const usersCollectionName = config.db.collections.users;

module.exports = {
    SaveImage: function (imageData, callback) {
        var userIdObject = DAL.GetObjectId(imageData.userId);

        var imageObj = {
            "image": imageData.imgBase64,
            "userId": userIdObject,
            "updateDate": new Date()
        };

        // Delete the current picture of the user.
        DAL.Delete(collectionName, { "userId": userIdObject }, function (count) {
            if (count == null) {
                callback(null);
            }
            else {
                // Insert the image to the collection of profile pictures.
                DAL.Insert(collectionName, imageObj, function (imageId) {
                    // In case the image insert was not successful.
                    if (imageId == null) {
                        callback(null);
                    }
                    else {
                        var userProfile = { $set: { "profile": imageId } };

                        // Update the id of the profile picture of the user.
                        DAL.UpdateOne(usersCollectionName, { "_id": userIdObject }, userProfile, function (user) {
                            callback(user);
                        });
                    }
                });
            }
        });
    },

    DeleteImage: function (userId, profileId, callback) {
        var usersFilter = { "_id": DAL.GetObjectId(userId) };
        var userObjectFieldDeleteQuery = { $unset: { profile: "" } };

        DAL.UpdateOne(usersCollectionName, usersFilter, userObjectFieldDeleteQuery, function (user) {
            if (user) {
                var profileFilter = { "_id": DAL.GetObjectId(profileId) };

                DAL.Delete(collectionName, profileFilter, function (result) {
                    if (result) {
                        callback(user);
                    }
                    else {
                        callback(null);
                    }

                })
            }
            else {
                callback(result);
            }
        });
    }
}