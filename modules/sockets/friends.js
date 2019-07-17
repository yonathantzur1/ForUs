const loginBL = require('../BL/welcome/loginBL');
const profilePictureBL = require('../BL/profilePictureBL');
const tokenHandler = require('../handlers/tokenHandler');
const mailer = require('../mailer');
const events = require('../events');
const logger = require('../../logger');

module.exports = (io, socket, connectedUsers) => {
    socket.on('ServerUpdateFriendRequestsStatus', function (friendId) {
        let token = tokenHandler.DecodeTokenFromSocket(socket);

        if (token) {
            io.to(token.user._id).emit('ClientUpdateFriendRequestsStatus', friendId);
        }
    });

    socket.on('ServerUpdateFriendRequests', function (friendRequests) {
        let token = tokenHandler.DecodeTokenFromSocket(socket);

        if (token) {
            io.to(token.user._id).emit('ClientUpdateFriendRequests', friendRequests);
        }
    });

    socket.on('SendFriendRequest', function (friendId) {
        let token = tokenHandler.DecodeTokenFromSocket(socket);

        if (token) {
            let user = token.user;
            let userFullName = user.firstName + " " + user.lastName;

            // In case the friend is online.
            if (connectedUsers[friendId]) {
                io.to(friendId).emit('GetFriendRequest', user._id, userFullName);
            }
            else {
                loginBL.GetUserById(friendId).then((friendObj) => {
                    if (friendObj) {
                        mailer.FriendRequestAlert(friendObj.email, friendObj.firstName, userFullName, user._id);
                    }
                }).catch(logger.error);
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
        let token = tokenHandler.DecodeTokenFromSocket(socket);

        if (token) {
            // In case the confirmed user is not login.
            if (!connectedUsers[friend._id]) {
                let userName = token.user.firstName + " " + token.user.lastName;
                let friendEmail = friend.email;
                mailer.FriendRequestConfirm(friendEmail, userName, friend.firstName);
            }

            delete friend.email;
            io.to(token.user._id).emit('ClientAddFriend', friend);
        }

    });

    socket.on('ServerFriendAddedUpdate', function (friendId) {
        let token = tokenHandler.DecodeTokenFromSocket(socket);

        if (token) {
            let user = token.user;

            // Build the object that will be sent to the user that submit the friend request.
            let clientFriendObj = {
                "_id": user._id,
                "firstName": user.firstName,
                "lastName": user.lastName,
                "profileImage": null
            }

            if (user.profile) {
                profilePictureBL.GetUserProfileImage(user.profile).then((result) => {
                    clientFriendObj.profileImage = result.image;
                    io.to(friendId).emit('ClientFriendAddedUpdate', clientFriendObj);
                }).catch(logger.error);
            }
            else {
                io.to(friendId).emit('ClientFriendAddedUpdate', clientFriendObj);
            }
        }
    });

    socket.on('ServerRemoveFriend', function (friendId) {
        let token = tokenHandler.DecodeTokenFromSocket(socket);

        if (token && token.user.friends.indexOf(friendId) != -1) {
            let currUserId = token.user._id;
            io.to(currUserId).emit('ClientRemoveFriend', friendId);
            io.to(friendId).emit('ClientRemoveFriend', currUserId);
        }
    });

    events.on('socket.RemoveFriendUser', RemoveFriendUser);

    function RemoveFriendUser(userId, userName, friendsIds) {
        friendsIds.forEach(friendId => {
            io.to(friendId).emit('ClientRemoveFriendUser', userId, userName);
        });
    }
}