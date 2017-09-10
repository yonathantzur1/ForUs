var general = require('./general.js');

module.exports = function (io, jwt, config) {
    var connectedUsers = {};
    var socketsDictionary = {};

    io.on('connection', function (socket) {

        socket.on('login', function (token) {
            token = general.DecodeToken(token);

            jwt.verify(token, config.jwtSecret, function (err, decoded) {
                // In case the token is valid.
                if (!err && decoded) {
                    socket.join(decoded.user._id);
                    decoded.user.socketId = socket.id
                    connectedUsers[decoded.user._id] = decoded.user;
                    socketsDictionary[socket.id] = decoded.user._id;
                }
            });
        });

        require('../modules/serverChat.js')(io, jwt, config, socket, connectedUsers);

        socket.on('disconnect', function () {
            var userId = socketsDictionary[socket.id];

            delete socketsDictionary[socket.id];
            delete connectedUsers[userId];
        });
    });
}