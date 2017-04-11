var DAL = require('../DAL.js');

module.exports = {
    SaveImage: function (collectionName, usersCollectionName, imageData, callback) {
        var userIdObject = DAL.GetObjectId(imageData.userId);
        imageObj = {
            "image": imageData.imgBase64,
            "userId": userIdObject
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
                        var userProfile = { "profile": imageId };

                        // Update the id of the profile picture of the user.
                        DAL.Update(usersCollectionName, { "_id": userIdObject }, userProfile, function (user) {
                            callback(user);
                        });
                    }
                });
            }
        });
    }
}