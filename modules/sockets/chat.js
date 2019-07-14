const chatBL = require('../BL/chatBL');
const navbarBL = require('../BL/navbarBL');
const generator = require('../generator');
const tokenHandler = require('../handlers/tokenHandler');
const logger = require('../../logger');

module.exports = (io, socket, connectedUsers) => {

    socket.on('SendMessage', function (msgData) {
        let originalMsgData = Object.assign({}, msgData);

        // Delete spaces from the start and the end of the message text.
        msgData.time = new Date();
        msgData.id = generator.GenerateId();
        msgData.text = (msgData.isImage) ? msgData.text : msgData.text.trim();
        let token = tokenHandler.DecodeTokenFromSocket(socket);

        // In case the message is to the user friend.
        if (token && ValidateMessage(msgData, token.user)) {
            // In case the friend is online.
            if (connectedUsers[msgData.to]) {
                io.to(msgData.to).emit('GetMessage', msgData);
            }
            else {
                let senderObj = connectedUsers[msgData.from];
                let senderName = senderObj ? (senderObj.firstName + " " + senderObj.lastName) : null;
                navbarBL.AddMessageNotification(msgData.from, msgData.to, msgData.id, senderName);
            }

            chatBL.AddMessageToChat(msgData).then((result) => {
                if (result) {
                    io.to(msgData.from).emit('ClientUpdateSendMessage', originalMsgData);
                    io.to(msgData.to).emit('ClientUpdateGetMessage', originalMsgData);
                }
            }).catch(logger.error);
        }
    });

    socket.on('ServerGetOnlineFriends', function () {
        let token = tokenHandler.DecodeTokenFromSocket(socket);

        if (token) {
            let user = token.user;
            let onlineFriendsIds = [];

            user.friends.forEach(friendId => {
                if (connectedUsers[friendId]) {
                    onlineFriendsIds.push(friendId);
                }
            });

            io.to(user._id).emit('ClientGetOnlineFriends', onlineFriendsIds);
        }
    });

    socket.on('ServerFriendTyping', function (friendId) {
        let token = tokenHandler.DecodeTokenFromSocket(socket);

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