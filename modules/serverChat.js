var chatBL = require('./BL/chatBL');
var general = require('./general.js');

module.exports = function (io, jwt, config, socket, connectedUsers) {
    socket.on('SendMessage', function (msgData, token) {
        // Delete spaces from the start and the end of the message text.
        msgData.text = msgData.text.trim();
        msgData.time = new Date();
        token = general.DecodeToken(token);

        jwt.verify(token, config.jwtSecret, function (err, decoded) {
            // In case the token is valid and the message is to the user friend.
            if (!err && decoded && ValidateMessage(msgData, decoded.user)) {
                io.to(msgData.to).emit('GetMessage', msgData);
                chatBL.AddMessageToChat(msgData);
            }
        });
    });
}

function ValidateMessage(msgData, user) {
    if (user._id == msgData.from &&
        user.friends.indexOf(msgData.to) != -1 &&
        msgData.text &&
        msgData.text.length <= 600) {
        return true;
    }
    else {
        return false;
    }
}