module.exports = function (io, jwt, config) {
    var connectedUsers = {};

    io.on('connection', function (socket) {

        socket.on('login', function (token) {
            jwt.verify(token, config.jwtSecret, function (err, decoded) {
                if (!err && decoded) {
                    socket.join(decoded.user._id);
                }
            });
        });

        socket.on('message', function (data) {

        });

        socket.on('disconnect', function () {

        });
    });
}