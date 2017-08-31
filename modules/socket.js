module.exports = function (io, jwt, config) {
    var connectedUsers = {};

    io.on('connection', function (socket) {

        socket.on('login', function (token) {
            jwt.verify(token, config.jwtSecret, function (err, decoded) {
                // In case the token is valid.
                if (!err && decoded) {
                    socket.join(decoded.user._id);
                    connectedUsers[socket.id] = decoded.user._id;
                }
            });
        });

        socket.on('SendMessage', function (msgData, token) {
            // Delete spaces from the start and the end of the message text.
            msgData.text = msgData.text.trim();

            jwt.verify(token, config.jwtSecret, function (err, decoded) {
                // In case the token is valid and the message is to the user friend.
                if (!err && decoded && ValidateMessage(msgData, decoded.user)) {
                    io.to(msgData.to).emit('GetMessage', msgData);
                }
            });
        });

        socket.on('disconnect', function () {
            delete connectedUsers[socket.id];
        });
    });

    function ValidateMessage(msgData, user) {
        if (user._id == msgData.from &&
            user.friends.indexOf(msgData.to) != -1 &&
            msgData.text) {
            return true;
        }
        else {
            return false;
        }
    }
}