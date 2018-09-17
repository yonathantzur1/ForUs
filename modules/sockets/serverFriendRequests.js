const loginBL = require('../BL/login/loginBL');
const profilePictureBL = require('../BL/profilePictureBL');
const tokenHandler = require('../handlers/tokenHandler');
const mailer = require('../mailer');

module.exports = function (io, socket, socketsDictionary, connectedUsers) {
    socket.on('ServerUpdateFriendRequestsStatus', function (friendId) {
        var token = tokenHandler.DecodeTokenFromSocket(socket);

        if (token) {
            io.to(token.user._id).emit('ClientUpdateFriendRequestsStatus', friendId);
        }
    });

    socket.on('ServerUpdateFriendRequests', function (friendRequests) {
        var token = tokenHandler.DecodeTokenFromSocket(socket);

        if (token) {
            io.to(token.user._id).emit('ClientUpdateFriendRequests', friendRequests);
        }
    });

    socket.on('SendFriendRequest', function (friendId) {
        var token = tokenHandler.DecodeTokenFromSocket(socket);

        if (token) {
            var user = token.user;
            var userFullName = user.firstName + " " + user.lastName;

            // In case the friend is online.
            if (connectedUsers[friendId]) {
                io.to(friendId).emit('GetFriendRequest', user._id, userFullName);
            }
            else {
                loginBL.GetUserById(friendId).then((friendObj) => {
                    friendObj &&
                        mailer.FriendRequestAlert(friendObj.email, friendObj.firstName, userFullName);
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
        var token = tokenHandler.DecodeTokenFromSocket(socket);

        if (token) {
            // In case the confirmed user is not login.
            if (!connectedUsers[friend._id]) {
                var userName = token.user.firstName + " " + token.user.lastName;
                var friendEmail = friend.email;
                mailer.FriendRequestConfirm(friendEmail, userName, friend.firstName);
            }

            delete friend.email;
            io.to(token.user._id).emit('ClientAddFriend', friend);
        }

    });

    socket.on('ServerFriendAddedUpdate', function (friendId) {
        var token = tokenHandler.DecodeTokenFromSocket(socket);

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

    socket.on('ServerRemoveFriend', function (friendId) {
        var token = tokenHandler.DecodeTokenFromSocket(socket);

        var x = socketsDictionary;
        var y = connectedUsers;

        if (token && token.user.friends.indexOf(friendId) != -1) {
            var currUserId = token.user._id;
            io.to(currUserId).emit('ClientRemoveFriend', friendId);
            io.to(friendId).emit('ClientRemoveFriend', currUserId);
        }
    });
}