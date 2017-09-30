var profilePictureBL = require('./BL/profilePictureBL');
var general = require('./general.js');

module.exports = function (io, jwt, config, socket, socketsDictionary, connectedUsers) {
    socket.on('ServerUpdateFriendRequests', function (token, friendRequests) {
        token = general.DecodeToken(token);

        jwt.verify(token, config.jwtSecret, function (err, decoded) {
            // In case the token is valid.
            if (!err && decoded) {
                io.to(decoded.user._id).emit('ClientUpdateFriendRequests', friendRequests);
            }
        });

    });

    socket.on('SendFriendRequest', function (userId, friendId) {
        var user = connectedUsers[userId];
        var userFullName = user.firstName + " " + user.lastName;
        io.to(friendId).emit('GetFriendRequest', userId, userFullName);
    });

    socket.on('RemoveFriendRequest', function (userId, friendId) {
        io.to(friendId).emit('DeleteFriendRequest', userId);
    });

    socket.on('ServerFriendAddedUpdate', function (token, friendId) {
        token = general.DecodeToken(token);

        jwt.verify(token, config.jwtSecret, function (err, decoded) {
            // In case the token is valid.
            if (!err && decoded) {
                var user = decoded.user;

                // Build the object that will be sent to the user that submit the friend request.
                var clientFriendObj = {
                    "_id": user._id,
                    "firstName": user.firstName,
                    "lastName": user.lastName,
                    "profileImage": null
                }

                if (user.profile) {
                    profilePictureBL.GetUserProfileImage(user.profile, function (result) {
                        clientFriendObj.profileImage = result.image;
                        io.to(friendId).emit('ClientFriendAddedUpdate', clientFriendObj);
                    });
                }
                else {
                    io.to(friendId).emit('ClientFriendAddedUpdate', clientFriendObj);
                }
            }
        });
    });
}