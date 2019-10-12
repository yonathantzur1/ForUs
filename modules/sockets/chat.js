const chatBL = require('../BL/chatBL');
const navbarBL = require('../BL/navbarBL');
const generator = require('../generator');
const tokenHandler = require('../handlers/tokenHandler');

module.exports = (io, socket, connectedUsers) => {

    socket.on('SendMessage', (msgData) => {
        let originalMsgData = Object.assign({}, msgData);

        // Delete spaces from the start and the end of the message text.
        msgData.time = new Date();
        msgData.id = generator.generateId();
        msgData.text = (msgData.isImage) ? msgData.text : msgData.text.trim();
        let token = tokenHandler.decodeTokenFromSocket(socket);

        // In case the message is to the user friend.
        if (token && validateMessage(msgData, token.user)) {
            // In case the friend is online.
            if (connectedUsers[msgData.to]) {
                io.to(msgData.to).emit('GetMessage', msgData);
            }
            else {
                let senderObj = connectedUsers[msgData.from];
                let senderName = senderObj ? (senderObj.firstName + " " + senderObj.lastName) : null;
                navbarBL.addMessageNotification(msgData.from, msgData.to, msgData.id, senderName);
            }

            chatBL.addMessageToChat(msgData);

            io.to(msgData.from).emit('ClientUpdateSendMessage', originalMsgData);
            io.to(msgData.to).emit('ClientUpdateGetMessage', originalMsgData);
        }
    });

    socket.on('ServerGetOnlineFriends', function () {
        let token = tokenHandler.decodeTokenFromSocket(socket);

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
        let token = tokenHandler.decodeTokenFromSocket(socket);

        if (token) {
            io.to(friendId).emit('ClientFriendTyping', token.user._id);
        }
    });
};

function validateMessage(msgData, user) {
    return (user._id == msgData.from &&
        user.friends.indexOf(msgData.to) != -1 &&
        msgData.text &&
        (msgData.isImage || msgData.text.length <= 600));
}