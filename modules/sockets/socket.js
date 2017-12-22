var config = require('../config');
var general = require('../general');
var jwt = require('jsonwebtoken');

var socketsDictionary = {};
var connectedUsers = {};

module.exports = function (io) {
    io.on('connection', function (socket) {

        socket.on('login', function () {
            var token = general.DecodeToken(general.GetTokenFromSocket(socket));

            if (token) {
                var user = token.user;

                // In case the user is already login.
                if (connectedUsers[user._id]) {
                    var loginUserObj = connectedUsers[user._id];
                    user.socketIds = loginUserObj.socketIds;
                    user.socketIds.push(socket.id);
                }
                else {
                    user.socketIds = [socket.id];
                }

                socket.join(user._id);
                socketsDictionary[socket.id] = user._id;
                connectedUsers[user._id] = user;

                var connectionUserFriends = user.friends;

                var statusObj = {
                    "friendId": user._id,
                    "isOnline": true
                }

                connectionUserFriends.forEach(friendId => {
                    io.to(friendId).emit('GetFriendConnectionStatus', statusObj);
                });
            }
        });

        require('./serverChat.js')(io, socket, socketsDictionary, connectedUsers);
        require('./serverFriendRequests.js')(io, socket, socketsDictionary, connectedUsers);

        socket.on('disconnect', function () {
            LogoutUser(io, socket);
        });
    });
}

function LogoutUser(io, socket) {
    var disconnectUserId = socketsDictionary[socket.id];
    var disconnectUser = connectedUsers[disconnectUserId];

    if (disconnectUser) {
        // In case the user was connected only once.
        if (disconnectUser.socketIds.length == 1) {
            var disconnectUserFriends = disconnectUser.friends;

            delete socketsDictionary[socket.id];
            delete connectedUsers[disconnectUserId];

            var statusObj = {
                "friendId": disconnectUserId,
                "isOnline": false
            }

            disconnectUserFriends.forEach(friendId => {
                io.to(friendId).emit('GetFriendConnectionStatus', statusObj);
            });
        }
        else {
            delete socketsDictionary[socket.id];
            disconnectUser.socketIds.splice(disconnectUser.socketIds.indexOf(socket.id), 1);
        }
    }
}