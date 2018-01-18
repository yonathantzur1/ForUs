const DAL = require('../DAL.js');
const config = require('../config.js');
const encryption = require('../encryption.js');

const collectionName = "Chats";

module.exports = {
    GetAllChats: function (userId, callback) {
        var sortObj = { "lastMessage.time": -1 };
        var queryObj = {
            "membersIds": userId,
            "messages": { $ne: [] }
        };

        DAL.FindSpecific(collectionName, queryObj, { "membersIds": 1, "lastMessage": 1 }, function (chats) {
            if (chats) {
                // Decode last message text for all chats.
                chats.forEach(function (chat) {
                    chat.lastMessage.text = encryption.decrypt(chat.lastMessage.text);
                    chat.friendId = chat.membersIds.find(function (id) {
                        return (id != userId);
                    });
                });
            }

            callback(chats);
        }, sortObj);
    }
}