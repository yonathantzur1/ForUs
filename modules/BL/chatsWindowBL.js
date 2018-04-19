const DAL = require('../DAL.js');
const config = require('../config.js');
const encryption = require('../encryption.js');

const collectionName = "Chats";

module.exports = {
    GetAllChats: (userId) => {
        return new Promise((resolve, reject) => {
            var sortObj = { "lastMessage.time": -1 };
            var queryObj = {
                "membersIds": userId,
                "messages": { $ne: [] }
            };

            DAL.FindSpecific(collectionName, queryObj, { "membersIds": 1, "lastMessage": 1 }, sortObj)
                .then((chats) => {
                    if (chats) {
                        // Decode last message text for all chats.
                        chats.forEach((chat) => {
                            chat.lastMessage.text = encryption.decrypt(chat.lastMessage.text);
                            chat.friendId = chat.membersIds.find((id) => {
                                return (id != userId);
                            });
                        });
                    }

                    resolve(chats);
                }).catch(reject);
        });
    }
}