module.exports = function (io) {
    io.on('connection', function (socket) {

        socket.on('login', function(userId) {
            socket.join(userId);
        });

        socket.on('message', function (data) {
            io.emit('chat message', "from sever");
        });

        socket.on('disconnect', function () {
            
        });
    });
}