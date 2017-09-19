var chatBL = require('./BL/chatBL');
var navbarBL = require('./BL/navbarBL');
var general = require('./general.js');

module.exports = function (io, jwt, config, socket, socketsDictionary, connectedUsers) {
    socket.on('SendMessage', function (msgData, token) {
        // Delete spaces from the start and the end of the message text.
        msgData.text = msgData.text.trim();
        msgData.time = new Date();
        token = general.DecodeToken(token);

        jwt.verify(token, config.jwtSecret, function (err, decoded) {
            // In case the token is valid and the message is to the user friend.
            if (!err && decoded && ValidateMessage(msgData, decoded.user)) {
                // In case the friend is online.
                if (connectedUsers[msgData.to]) {
                    io.to(msgData.to).emit('GetMessage', msgData);
                }
                else {
                    navbarBL.AddMessageNotification(msgData.from, msgData.to);
                }
                
                chatBL.AddMessageToChat(msgData);
            }
        });
    });

    socket.on('ServerGetOnlineFriends', function (token) {
        token = general.DecodeToken(token);

        jwt.verify(token, config.jwtSecret, function (err, decoded) {4
            // In case the token is valid.
            if (!err && decoded) {
                var user = decoded.user;
                var onlineFriendsIds = [];

                user.friends.forEach(friendId => {
                    if (connectedUsers[friendId]) {
                        onlineFriendsIds.push(friendId);
                    }   
                });

                io.to(user._id).emit('ClientGetOnlineFriends', onlineFriendsIds);
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