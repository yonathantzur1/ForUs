var collectionName = "Profiles";
var usersCollectionName = "Users";

module.exports = function (app, profileBL) {
    // Add new profile image.
    app.post('/saveImage', function (req, res) {
        var imageData =  req.body;

        // In case the user was not found on session
        if (!req.session.currUser) {
            res.send(null);
        }
        else {
            imageData.userId = req.session.currUser._id;
        }

        profileBL.SaveImage(collectionName, usersCollectionName, imageData, function (result) {
            res.send(result);
        });
    });
};