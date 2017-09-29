module.exports = function (io, jwt, config, socket, socketsDictionary, connectedUsers) {
    socket.on('ServerUpdateFriendRequests', function (userId, friendRequests) {
        io.to(userId).emit('ClientUpdateFriendRequests', friendRequests);
    });

    socket.on('SendFriendRequest', function (userId, friendId) {
        var user = connectedUsers[userId];
        var userFullName = user.firstName + " " + user.lastName;
        io.to(friendId).emit('GetFriendRequest', userId, userFullName);
    });

    socket.on('RemoveFriendRequest', function (userId, friendId) {
        io.to(friendId).emit('DeleteFriendRequest', userId);
    });
}