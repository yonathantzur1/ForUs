var DAL = require('../DAL.js');
var config = require('../config.js');
var encryption = require('../encryption.js');

var collectionName = "Chats";

module.exports = {
    GetAllChats: function (userId, callback) {
        var sortObj = { "lastMessage.time": -1 };

        DAL.FindSpecific(collectionName, {}, { "membersIds": 1, "lastMessage": 1 }, function (chats) {
            // Decode last message text for all chats.
            chats.forEach(function (chat) {
                chat.lastMessage.text = encryption.decrypt(chat.lastMessage.text);
                chat.friendId = chat.membersIds.find(function (id) {
                    return (id != userId);
                });
            });

            callback(chats);
        }, sortObj);
    }
}