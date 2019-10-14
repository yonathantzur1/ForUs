const DAL = require('../DAL.js');
const config = require('../../config');
const encryption = require('../security/encryption');
const navbarBL = require('./navbarBL');

const chatsCollectionName = config.db.collections.chats;
const messagesInPage = 40;

let self = module.exports = {
    getChat(membersIds, user) {
        return new Promise((resolve, reject) => {
            if (self.validateUserGetChat(membersIds, user.friends, user._id)) {
                let chatQueryFilter = {
                    $match: {
                        "membersIds": { $all: membersIds }
                    }
                };

                let sliceObj = {
                    $project: {
                        messages: { $slice: ["$messages", -1 * messagesInPage] },
                        totalMessagesNum: { $size: "$messages" }
                    }
                };

                let aggregate = [chatQueryFilter, sliceObj];

                DAL.aggregate(chatsCollectionName, aggregate).then((result) => {
                    let chat;

                    // In case the chat is not exists.
                    if (result.length == 0) {
                        chat = false;
                        self.createChat(membersIds);
                    }
                    else {
                        chat = result[0];
                        chat.messages = self.decryptChatMessages(chat.messages);
                    }

                    resolve(chat);
                }).catch(reject);
            }
            else {
                resolve(null);
            }
        });
    },

    getChatPage(membersIds, user, currMessagesNum, totalMessagesNum) {
        return new Promise((resolve, reject) => {
            if (self.validateUserGetChat(membersIds, user.friends, user._id)) {
                let chatQueryFilter = {
                    $match: {
                        "membersIds": { $all: membersIds }
                    }
                };

                let messagesInPage = messagesInPage;
                let page = (currMessagesNum / messagesInPage) + 1;
                let selectNextNumber = Math.min(messagesInPage, (totalMessagesNum - currMessagesNum));

                let sliceObj = {
                    $project: {
                        messages: { $slice: ["$messages", (-1 * messagesInPage * page), selectNextNumber] }
                    }
                };

                let aggregate = [chatQueryFilter, sliceObj];

                DAL.aggregate(chatsCollectionName, aggregate).then((result) => {
                    let chat;

                    if (result.length != 0) {
                        chat = result[0];
                        chat.messages = self.decryptChatMessages(chat.messages);
                    }

                    resolve(chat);
                }).catch(reject);
            }
            else {
                resolve(null);
            }
        });
    },

    createChat(membersIds) {
        let chatQueryFilter = {
            "membersIds": membersIds
        };

        let chatObj = {
            $set: {
                "membersIds": membersIds,
                "messages": []
            }
        };

        DAL.updateOne(chatsCollectionName, chatQueryFilter, chatObj, true);
    },

    addMessageToChat(msgData) {
        return new Promise((resolve, reject) => {
            // Encrypt message text.
            msgData.text = encryption.encrypt(msgData.text);

            let chatFilter = { "membersIds": { $all: [msgData.from, msgData.to] } };

            // Build message object to save on DB.
            let message = {
                id: msgData.id,
                from: msgData.from,
                time: msgData.time,
                text: msgData.text
            };
            msgData.isImage && (message.isImage = true);

            let chatUpdateQuery = {
                $push: {
                    "messages": message
                }
            };

            DAL.updateOne(chatsCollectionName, chatFilter, chatUpdateQuery).then((result) => {
                result ? resolve(true) : resolve(false);
            }).catch(reject);
        });
    },

    decryptChatMessages(messages) {
        messages.forEach((msgData) => {
            msgData.text = encryption.decrypt(msgData.text);
        });

        return messages;
    },

    validateUserGetChat(membersIds, userFriends, userId) {
        for (let i = 0; i < membersIds.length; i++) {
            if (userFriends.indexOf(membersIds[i]) == -1 && membersIds[i] != userId) {
                return false;
            }
        }

        return true;
    },

    getAllPreviewChats(userId) {
        return new Promise((resolve, reject) => {
            let chatsFilter = {
                $match: {
                    "membersIds": userId,
                    "messages": { $ne: [] }
                }
            };

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
            ];

            DAL.aggregate(chatsCollectionName, aggregateArray).then((chats) => {
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

                navbarBL.getFriends(chatsFriendsIds).then(friends => {
                    friends.forEach(friend => {
                        chats[indexChatPositionByFriendId[friend._id.toString()]].friend = friend;
                    });

                    resolve(chats);
                });
            }).catch(reject);

        });
    }
};