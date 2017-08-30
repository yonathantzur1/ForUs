module.exports = function (io, jwt, config) {
    var connectedUsers = {};

    io.on('connection', function (socket) {

        socket.on('login', function (token) {
            jwt.verify(token, config.jwtSecret, function (err, decoded) {
                // In case the token is valid.
                if (!err && decoded) {
                    socket.join(decoded.user._id);
                    connectedUsers[socket.id] = decoded.user;
                }
            });
        });

        socket.on('SendMessage', function (msgData, token) {
            jwt.verify(token, config.jwtSecret, function (err, decoded) {
                // In case the token is valid and the message is to the user friend.
                if (!err && decoded && decoded.user.friends.indexOf(msgData.to) != -1) {
                    io.to(msgData.to).emit('GetMessage', msgData);     
                }
            });
        });

        socket.on('disconnect', function () {
            delete connectedUsers[socket.id];
        });
    });
}