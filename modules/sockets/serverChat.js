var chatBL = require('../BL/chatBL.js');
var navbarBL = require('../BL/navbarBL.js');

module.exports = function (io, jwt, config, socket, socketsDictionary, connectedUsers, general) {

    socket.on('SendMessage', function (msgData) {
        var originalMsgData = Object.assign({}, msgData);

        // Delete spaces from the start and the end of the message text.
        msgData.time = new Date();
        msgData.id = general.GenerateId();
        msgData.text = (msgData.isImage) ? msgData.text : msgData.text.trim();
        var token = general.DecodeToken(general.GetTokenFromSocket(socket));

        // In case the message is to the user friend.
        if (token && ValidateMessage(msgData, token.user)) {
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

    socket.on('ServerGetOnlineFriends', function () {
        var token = general.DecodeToken(general.GetTokenFromSocket(socket));

        if (token) {
            var user = token.user;
            var onlineFriendsIds = [];

            user.friends.forEach(friendId => {
                if (connectedUsers[friendId]) {
                    onlineFriendsIds.push(friendId);
                }
            });

            io.to(user._id).emit('ClientGetOnlineFriends', onlineFriendsIds);
        }
    });

    socket.on('ServerFriendTyping', function (friendId) {
        var token = general.DecodeToken(general.GetTokenFromSocket(socket));

        if (token) {
            io.to(friendId).emit('ClientFriendTyping', token.user._id);
        }
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