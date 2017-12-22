var profilePictureBL = require('../BL/profilePictureBL.js');
var config = require('../config');
var general = require('../general');
var jwt = require('jsonwebtoken');

module.exports = function (io, socket, socketsDictionary, connectedUsers) {
    socket.on('ServerUpdateFriendRequestsStatus', function (friendId) {
        var token = general.DecodeToken(general.GetTokenFromSocket(socket));

        if (token) {
            io.to(token.user._id).emit('ClientUpdateFriendRequestsStatus', friendId);
        }
    });

    socket.on('ServerUpdateFriendRequests', function (friendRequests) {
        var token = general.DecodeToken(general.GetTokenFromSocket(socket));

        if (token) {
            io.to(token.user._id).emit('ClientUpdateFriendRequests', friendRequests);
        }
    });

    socket.on('SendFriendRequest', function (friendId) {
        var token = general.DecodeToken(general.GetTokenFromSocket(socket));

        if (token) {
            var user = token.user;
            var userFullName = user.firstName + " " + user.lastName;
            io.to(friendId).emit('GetFriendRequest', user._id, userFullName);
        }
    });

    socket.on('RemoveFriendRequest', function (userId, friendId) {
        io.to(friendId).emit('DeleteFriendRequest', userId);
    });

    socket.on('ServerIgnoreFriendRequest', function (userId, friendId) {
        io.to(friendId).emit('ClientIgnoreFriendRequest', userId);
    });

    socket.on('ServerAddFriend', function (friend) {
        var token = general.DecodeToken(general.GetTokenFromSocket(socket));

        if (token) {
            io.to(token.user._id).emit('ClientAddFriend', friend);
        }

    });

    socket.on('ServerFriendAddedUpdate', function (friendId) {
        var token = general.DecodeToken(general.GetTokenFromSocket(socket));

        if (token) {
            var user = token.user;

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
}