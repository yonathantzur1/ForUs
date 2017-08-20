module.exports = function (io, jwt, config) {
    io.on('connection', function (socket) {

        socket.on('login', function (data) {
            jwt.verify(data.token, config.jwtSecret, function (err, decoded) {
                if (!err && decoded && (decoded.user._id == data.id)) {
                    socket.join(data.id);
                }
            });
        });

        socket.on('message', function (data) {
            
        });

        socket.on('disconnect', function () {

        });
    });
}