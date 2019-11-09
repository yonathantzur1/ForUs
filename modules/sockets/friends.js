const loginBL = require('../BL/welcome/loginBL');
const profilePictureBL = require('../BL/profilePictureBL');
const tokenHandler = require('../handlers/tokenHandler');
const mailer = require('../mailer');
const logger = require('../../logger');

module.exports = (io, socket, connectedUsers) => {
    socket.on('ServerUpdateFriendRequestsStatus', (friendId) => {
        let token = tokenHandler.decodeTokenFromSocket(socket);

        if (token) {
            io.to(token.user._id).emit('ClientUpdateFriendRequestsStatus', friendId);
        }
    });

    socket.on('ServerUpdateFriendRequests', (friendRequests) => {
        let token = tokenHandler.decodeTokenFromSocket(socket);

        if (token) {
            io.to(token.user._id).emit('ClientUpdateFriendRequests', friendRequests);
        }
    });

    socket.on('SendFriendRequest', (friendId) => {
        let token = tokenHandler.decodeTokenFromSocket(socket);

        if (token) {
            let user = token.user;
            let userFullName = user.firstName + " " + user.lastName;

            // In case the friend is online.
            if (connectedUsers[friendId]) {
                io.to(friendId).emit('GetFriendRequest', user._id, userFullName);
            }
            else {
                loginBL.getUserById(friendId).then((friendObj) => {
                    if (friendObj) {
                        mailer.friendRequestAlert(friendObj.email, friendObj.firstName, userFullName, user._id);
                    }
                }).catch(logger.error);
            }
        }
    });

    socket.on('removeFriendRequest', (userId, friendId) => {
        io.to(friendId).emit('DeleteFriendRequest', userId);
    });

    socket.on('ServerIgnoreFriendRequest', (userId, friendId) => {
        io.to(friendId).emit('ClientIgnoreFriendRequest', userId);
    });

    socket.on('ServerAddFriend', (friend) => {
        let token = tokenHandler.decodeTokenFromSocket(socket);

        if (token) {
            // In case the confirmed user is not login.
            if (!connectedUsers[friend._id]) {
                let userName = token.user.firstName + " " + token.user.lastName;
                let friendEmail = friend.email;
                mailer.friendRequestConfirm(friendEmail, userName, friend.firstName);
            }

            delete friend.email;
            io.to(token.user._id).emit('ClientAddFriend', friend);
        }

    });

    socket.on('ServerFriendAddedUpdate', (friendId) => {
        let token = tokenHandler.decodeTokenFromSocket(socket);

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
                profilePictureBL.getUserProfileImage(user.profile).then(result => {
                    clientFriendObj.profileImage = result.image;
                    io.to(friendId).emit('ClientFriendAddedUpdate', clientFriendObj);
                }).catch(logger.error);
            }
            else {
                io.to(friendId).emit('ClientFriendAddedUpdate', clientFriendObj);
            }
        }
    });

    socket.on('ServerRemoveFriend', (friendId) => {
        let token = tokenHandler.decodeTokenFromSocket(socket);

        if (token && token.user.friends.includes(friendId)) {
            let currUserId = token.user._id;
            io.to(currUserId).emit('ClientRemoveFriend', friendId);
            io.to(friendId).emit('ClientRemoveFriend', currUserId);
        }
    });
};