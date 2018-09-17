const DAL = require('../../DAL');
const encryption = require('../../security/encryption');

const navbarBL = require('../navbar/navbarBL');

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
                        var indexChatPositionByFriendId = {};
                        var chatsFriendsIds = [];

                        // Decode last message text for all chats.
                        chats.forEach((chat, index) => {
                            chat.lastMessage.text = encryption.decrypt(chat.lastMessage.text);

                            var friendId = chat.membersIds.find((id) => {
                                return (id != userId);
                            });
                            
                            indexChatPositionByFriendId[friendId] = index;
                            chatsFriendsIds.push(friendId);
                        });

                        navbarBL.GetFriends(chatsFriendsIds).then(friends => {
                            friends.forEach(friend => {
                                chats[indexChatPositionByFriendId[friend._id.toString()]].friend = friend;
                            });

                            resolve(chats);
                        }).catch(reject);
                    }
                    else {
                        resolve(chats);
                    }
                }).catch(reject);
        });
    }
}