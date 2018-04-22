const loginBL = require('../BL/loginBL');
const profilePictureBL = require('../BL/profilePictureBL');
const config = require('../config');
const general = require('../general');
const mailer = require('../mailer');
const jwt = require('jsonwebtoken');

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

            // In case the friend is online.
            if (connectedUsers[friendId]) {
                io.to(friendId).emit('GetFriendRequest', user._id, userFullName);
            }
            else {
                loginBL.GetUserById(friendId).then((friendObj) => {
                    friendObj && mailer.SendMail(friendObj.email,
                        mailer.GetFriendRequestAlertContent(friendObj.firstName, userFullName));
                }).catch((err) => {
                    // TODO: error log.
                });
            }
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
            // In case the confirmed user is not login.
            if (!connectedUsers[friend._id]) {
                var userName = token.user.firstName + " " + token.user.lastName;
                var friendEmail = friend.email;
                mailer.SendMail(friendEmail,
                    mailer.GetFriendRequestConfirmContent(userName, friend.firstName));
            }

            delete friend.email;
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
                profilePictureBL.GetUserProfileImage(user.profile).then((result) => {
                    clientFriendObj.profileImage = result.image;
                    io.to(friendId).emit('ClientFriendAddedUpdate', clientFriendObj);
                }).catch((err) => {
                    // TODO: error log.
                });
            }
            else {
                io.to(friendId).emit('ClientFriendAddedUpdate', clientFriendObj);
            }
        }
    });
}