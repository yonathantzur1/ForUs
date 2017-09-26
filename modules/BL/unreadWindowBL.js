var DAL = require('../DAL.js');

var collectionName = "Chats";

module.exports = {
    GetAllChats: function (callback) {
        var sortObj = { "lastMessage.time": -1 };

        DAL.FindSpecific(collectionName, {}, { "membersIds": 1, "lastMessage": 1 }, function (chats) {
            callback(chats);
        }, sortObj);
    }
}