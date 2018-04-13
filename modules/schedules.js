var schedule = require('node-schedule');
var chatBL = require('./BL/chatBL');


module.exports = function (connectedUsers) {
    // Task that removes all empty chats from DB every night at 00:00
    schedule.scheduleJob('0 0 * * *', function () {
        RemoveEmptyChats(connectedUsers);
    });
}

function RemoveEmptyChats(connectedUsers) {
    chatBL.GetAllEmptyChats(function (chats) {
        if (chats) {
            var chatsToRemove = [];

            // Searching for empty chats with offline members.
            chats.forEach(chat => {
                var isAllChatMembersOffline = true;

                // Check if all members of the chat are offline.
                for (var i = 0; i < chat.membersIds.length; i++) {
                    // In case the user is connect to the site.
                    if (connectedUsers[chat.membersIds[i]] != null) {
                        isAllChatMembersOffline = false;
                        break;
                    }
                }

                if (isAllChatMembersOffline) {
                    chatsToRemove.push(chat._id);
                }
            });

            if (chatsToRemove.length > 0) {
                chatBL.RemoveChatsByIds(chatsToRemove, function (result) { });
            }
        }
    });
}