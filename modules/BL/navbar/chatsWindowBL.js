const DAL = require('../../DAL');
const encryption = require('../../security/encryption');

const navbarBL = require('../navbar/navbarBL');

const collectionName = "Chats";

module.exports = {
    GetAllChats(userId) {
        return new Promise((resolve, reject) => {
            let chatsFilter = {
                $match: {
                    "membersIds": userId,
                    "messages": { $ne: [] }
                }
            }

            let sortObj = { $sort: { "lastMessage.time": -1 } };

            let aggregateArray = [
                chatsFilter,
                {
                    $project:
                    {
                        lastMessage: { $arrayElemAt: ["$messages", -1] },
                        membersIds: "$membersIds"
                    }
                },
                sortObj
            ]

            DAL.Aggregate(collectionName, aggregateArray).then((chats) => {
                let indexChatPositionByFriendId = {};
                let chatsFriendsIds = [];

                // Decode last message text for all chats.
                chats.forEach((chat, index) => {
                    chat.lastMessage.text = encryption.decrypt(chat.lastMessage.text);

                    let friendId = chat.membersIds.find((id) => {
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
            }).catch(reject);

        });
    }
}