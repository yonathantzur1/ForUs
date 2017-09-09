var general = require('./general.js');

module.exports = function (io, jwt, config) {
    var connectedUsers = {};

    io.on('connection', function (socket) {

        socket.on('login', function (token) {
            token = general.DecodeToken(token);

            jwt.verify(token, config.jwtSecret, function (err, decoded) {
                // In case the token is valid.
                if (!err && decoded) {
                    socket.join(decoded.user._id);
                    connectedUsers[socket.id] = decoded.user._id;
                }
            });
        });

        require('../modules/serverChat.js')(io, jwt, config, socket, connectedUsers);

        socket.on('disconnect', function () {
            delete connectedUsers[socket.id];
        });
    });
}