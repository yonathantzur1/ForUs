var encryption = require('../modules/encryption.js');

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

        var encryption = require('../modules/serverChat.js')(io, jwt, config, socket, connectedUsers);

        socket.on('disconnect', function () {
            delete connectedUsers[socket.id];
        });
    });
}