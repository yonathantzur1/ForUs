const tokenHandler = require('../handlers/tokenHandler');
const permissionHandler = require('../handlers/permissionHandler');
const events = require('../events');
const enums = require('../enums');
const jobs = require('../jobs');
const config = require('../../config');

let connectedUsers = {};

module.exports = (io) => {
    io.on('connection', (socket) => {

        // Import socket modules.
        require('./chat.js')(io, socket, connectedUsers);
        require('./friends.js')(io, socket, connectedUsers);

        socket.on('login', () => {
            let token = tokenHandler.decodeTokenFromSocket(socket);

            if (token) {
                let user = token.user;
                let userId = user._id;
                let connectUser = connectedUsers[userId];

                // In case the user is already login.
                if (connectUser) {
                    connectUser.lastKeepAlive = new Date();
                    connectUser.connections++;
                }
                else {
                    user.lastKeepAlive = new Date();
                    user.connections = 1;
                    connectedUsers[userId] = user;

                    let status = {
                        "friendId": userId,
                        "isOnline": true
                    }

                    user.friends.forEach(friendId => {
                        io.to(friendId).emit('UpdateFriendConnectionStatus', status);
                    });
                }

                // Join socket to socket room.
                socket.join(userId);
            }
        });

        socket.on('disconnect', () => {
            let token = tokenHandler.decodeTokenFromSocket(socket);

            if (token) {
                let userId = token.user._id;
                let user = connectedUsers[userId];

                if (user) {
                    // In case the user was connected only once.
                    if (user.connections == 1) {
                        let userFriendsIds = user.friends;
                        let status = {
                            "friendId": userId,
                            "isOnline": false
                        }

                        userFriendsIds.forEach(friendId => {
                            io.to(friendId).emit('UpdateFriendConnectionStatus', status);
                        });

                        delete connectedUsers[userId];
                    }
                    else {
                        user.connections--;
                    }
                }
            }
        });

        socket.on('LogoutUserSessionServer', (msg, userId) => {
            let token = tokenHandler.decodeTokenFromSocket(socket);

            // Logout the given user in case the sender is admin, or in case the logout is self.
            if (token &&
                (permissionHandler.isUserHasRootPermission(token.user.permissions) || !userId)) {
                io.to(userId || token.user._id).emit('LogoutUserSessionClient', msg);
            }
        });
    });

    events.on('socket.RemoveFriendUser', (userId, userName, friendsIds) => {
        friendsIds.forEach(friendId => {
            io.to(friendId).emit('ClientRemoveFriendUser', userId, userName);
        });
    });

    events.on('socket.UserSetToPrivate', (userId) => {
        io.emit('UserSetToPrivate', userId);
    });

    events.on('socket.LogoutUserSession', (userId, msg) => {
        io.to(userId).emit('LogoutUserSessionClient', msg);
    });

    return connectedUsers;
};

let keepAliveDelay = config.socket.keepAlive;

jobs.RegisterJob(enums.SYSTEM_JOBS_NAMES.CLEAN_DISCONNECT_USERS,
    CleanOfflineUsers,
    (keepAliveDelay + 1) * 1000);

function CleanOfflineUsers() {
    let disconnectUsersIds = [];

    // Running on all the connected users.
    Object.keys(connectedUsers).forEach(userId => {
        // Calculate seconds diffrence from the last user keep alive.
        let lastKeepAliveDelay = (new Date() - connectedUsers[userId].lastKeepAlive) / 1000;

        // In case the diffrence is big, disconnect the user.
        if (lastKeepAliveDelay > keepAliveDelay) {
            disconnectUsersIds.push(userId);
        }
    });

    // Remove the disconnected user and his sockets from dictionaries.
    disconnectUsersIds.forEach(userId => {
        delete connectedUsers[userId];
    });
}