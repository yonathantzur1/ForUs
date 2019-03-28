const logsBL = require('../BL/logsBL')
const tokenHandler = require('../handlers/tokenHandler');
const permissionHandler = require('../handlers/permissionHandler');
const events = require('../events');
const config = require('../../config');
const enums = require('../enums');
const jobs = require('../jobs');

let socketsDictionary = {};
let connectedUsers = {};

module.exports = (io) => {
    io.on('connection', function (socket) {

        // Import socket events.
        require('./serverChat.js')(io, socket, connectedUsers);
        require('./serverFriendRequests.js')(io, socket, connectedUsers);

        socket.on('login', function () {
            let token = tokenHandler.DecodeTokenFromSocket(socket);

            if (token) {
                let user = token.user;

                // In case the user is already login.
                if (connectedUsers[user._id]) {
                    let loginUserObj = connectedUsers[user._id];
                    user.socketIds = loginUserObj.socketIds;
                    user.socketIds.push(socket.id);
                }
                else {
                    user.socketIds = [socket.id];
                }

                socket.join(user._id);
                socketsDictionary[socket.id] = user._id;
                connectedUsers[user._id] = user;
                connectedUsers[user._id].lastKeepAlive = new Date();

                let connectionUserFriends = user.friends;

                let statusObj = {
                    "friendId": user._id,
                    "isOnline": true
                }

                connectionUserFriends.forEach(friendId => {
                    io.to(friendId).emit('GetFriendConnectionStatus', statusObj);
                });

                // Log - in case the email and password are valid but the user is blocked.
                logsBL.Login(user.email, socket);
            }
        });

        socket.on('disconnect', function () {
            LogoutUser(io, socket);
        });

        socket.on('LogoutUserSessionServer', function (userId, msg) {
            let token = tokenHandler.DecodeTokenFromSocket(socket);

            // Logout the given user in case the sender is admin, or in case the logout is self.
            if (token &&
                token.user &&
                (permissionHandler.IsUserHasRootPermission(token.user.permissions) || userId == null)) {
                io.to(userId || token.user._id).emit('LogoutUserSessionClient', msg);
            }
        });

        socket.on('ServerRemoveFriendUser', function (userId, userName, friendsIds) {
            let token = tokenHandler.DecodeTokenFromSocket(socket);

            if (token &&
                token.user &&
                permissionHandler.IsUserHasRootPermission(token.user.permissions)) {
                RemoveFriendUser(userId, userName, friendsIds)
            }
        });
    });

    function RemoveFriendUser(userId, userName, friendsIds) {
        friendsIds.forEach(friendId => {
            io.to(friendId).emit('ClientRemoveFriendUser', userId, userName);
        });
    }

    events.on('socket.RemoveFriendUser', RemoveFriendUser);

    events.on('socket.UserSetToPrivate', (userId) => {
        io.emit('UserSetToPrivate', userId);
    });

    return connectedUsers;
}

function LogoutUser(io, socket) {
    let disconnectUserId = socketsDictionary[socket.id];
    let disconnectUser = connectedUsers[disconnectUserId];

    if (disconnectUser) {
        // In case the user was connected only once.
        if (disconnectUser.socketIds.length == 1) {
            let disconnectUserFriends = disconnectUser.friends;

            delete socketsDictionary[socket.id];
            delete connectedUsers[disconnectUserId];

            let statusObj = {
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

function CleanDisconnectUsers() {
    let disconnectUsersIds = [];

    // Running on all the connected users.
    Object.keys(connectedUsers).forEach(userId => {
        // Calculate seconds diffrence from the last user keep alive.
        lastKeepAliveSecondsDelay = (new Date() - connectedUsers[userId].lastKeepAlive) / 1000;

        let x = socketsDictionary;
        // In case the diffrence is big, disconnect the user.
        if (lastKeepAliveSecondsDelay > config.socket.maxLastKeepAliveDelay) {
            disconnectUsersIds.push(userId);
        }
    });

    // Remove the disconnected user and his sockets from dictionaries.
    disconnectUsersIds.forEach(userId => {
        let socketIds = connectedUsers[userId].socketIds;
        delete connectedUsers[userId];

        socketIds.forEach(socketId => {
            delete socketsDictionary[socketId];
        });
    });

}

jobs.RegisterJob(enums.SYSTEM_JOBS_NAMES.CLEAN_DISCONNECT_USERS,
    CleanDisconnectUsers,
    config.socket.cleanDisconnectUsersIntervalTime * 1000);