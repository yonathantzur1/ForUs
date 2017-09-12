var general = require('./general.js');

var socketsDictionary = {};
var connectedUsers = {};

module.exports = function (io, jwt, config) {
    io.on('connection', function (socket) {

        socket.on('login', function (token) {
            token = general.DecodeToken(token);

            jwt.verify(token, config.jwtSecret, function (err, decoded) {
                // In case the token is valid.
                if (!err && decoded) {
                    var user = decoded.user;
                    user.socketId = socket.id;

                    socket.join(user._id);
                    socketsDictionary[socket.id] = user._id;
                    connectedUsers[user._id] = user;

                    var connectionUserId = socketsDictionary[socket.id];
                    var connectionUserFriends = connectedUsers[connectionUserId].friends;

                    var statusObj = {
                        "friendId": connectionUserId,
                        "isOnline": true
                    }

                    connectionUserFriends.forEach(friendId => {
                        io.to(friendId).emit('GetFriendConnectionStatus', statusObj);
                    });
                }
            });
        });

        socket.on('logout', function () {
            LogoutUser(io, socket);
        });

        require('../modules/serverChat.js')(io, jwt, config, socket, socketsDictionary, connectedUsers);

        socket.on('disconnect', function () {
            LogoutUser(io, socket);
        });
    });
}

function LogoutUser(io, socket) {
    var disconnectUserId = socketsDictionary[socket.id];
    var disconnectUser = connectedUsers[disconnectUserId];

    if (disconnectUser) {
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
}