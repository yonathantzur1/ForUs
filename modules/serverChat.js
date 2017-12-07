var chatBL = require('./BL/chatBL');
var navbarBL = require('./BL/navbarBL');
var general = require('./general.js');

module.exports = function (io, jwt, config, socket, socketsDictionary, connectedUsers) {

    socket.on('SendMessage', function (msgData) {
        var originalMsgData = Object.assign({}, msgData);

        // Delete spaces from the start and the end of the message text.
        msgData.time = new Date();
        msgData.id = general.GenerateId();
        msgData.text = (msgData.isImage) ? msgData.text : msgData.text.trim();
        var token = general.DecodeToken(general.GetTokenFromSocket(socket));

        jwt.verify(token, config.jwt.secret, function (err, decoded) {
            // In case the token is valid and the message is to the user friend.
            if (!err && decoded && ValidateMessage(msgData, decoded.user)) {
                // In case the friend is online.
                if (connectedUsers[msgData.to]) {
                    io.to(msgData.to).emit('GetMessage', msgData);
                }
                else {
                    navbarBL.AddMessageNotification(msgData.from, msgData.to, msgData.id);
                }

                chatBL.AddMessageToChat(msgData, function (result) {
                    if (result) {
                        io.to(msgData.from).emit('ClientUpdateSendMessage', originalMsgData);
                        io.to(msgData.to).emit('ClientUpdateGetMessage', originalMsgData);
                    }
                });
            }
        });
    });

    socket.on('ServerGetOnlineFriends', function () {
        var token = general.DecodeToken(general.GetTokenFromSocket(socket));

        jwt.verify(token, config.jwt.secret, function (err, decoded) {
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

    socket.on('ServerFriendTyping', function (friendId) {
        var token = general.DecodeToken(general.GetTokenFromSocket(socket));

        jwt.verify(token, config.jwt.secret, function (err, decoded) {
            // In case the token is valid.
            if (!err && decoded) {
                io.to(friendId).emit('ClientFriendTyping', decoded.user._id);
            }
        });
    });
}

function ValidateMessage(msgData, user) {
    if (user._id == msgData.from &&
        user.friends.indexOf(msgData.to) != -1 &&
        msgData.text &&
        (msgData.isImage || msgData.text.length <= 600)) {
        return true;
    }
    else {
        return false;
    }
}