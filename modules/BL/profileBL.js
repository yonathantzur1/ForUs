var DAL = require('../DAL.js');

module.exports = {
    SaveImage: function (collectionName, usersCollectionName, imageData, callback) {
        imageObj = { "image": imageData.imgBase64 };

        // Insert the image to the collection of profile pictures.
        DAL.Insert(collectionName, imageObj, function (imageId) {
            // In case the image insert was not successful.
            if (imageId == null) {
                callback(null);
            }
            else {
                var userProfile = { "profile": imageId };

                // Update the id of the profile picture of the user.
                DAL.Update(usersCollectionName, { "_id": DAL.GetObjectId(imageData.userId) }, userProfile, function (result) {
                    callback(result);
                });
            }
        });
    }
}