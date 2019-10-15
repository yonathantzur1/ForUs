const DAL = require('../DAL.js');
const config = require('../../config');
const encryption = require('../security/encryption');
const navbarBL = require('./navbarBL');

const errorHandler = require('../handlers/errorHandler');

const chatsCollectionName = config.db.collections.chats;
const messagesInPage = 40;

module.exports = {
    async getChat(membersIds, user) {
        if (!this.validateUserGetChat(membersIds, user.friends, user._id)) {
            return errorHandler.promiseSecure("The user: " + user._id +
                " was try to get invalid chat with users ids: " + JSON.stringify(user.friends));
        }

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

        let result = await DAL.aggregate(chatsCollectionName, aggregate)
            .catch(errorHandler.promiseError);

        // In case the chat is not exists.
        if (result.length == 0) {
            let createChatResult = await this.createChat(membersIds)
                .catch(errorHandler.promiseError);

            if (!createChatResult) {
                return errorHandler.promiseError("Failed to create new chat");
            }

            return false;
        }

        let chat = result[0];
        chat.messages = this.decryptChatMessages(chat.messages);

        return chat;
    },

    async getChatPage(membersIds, user, currMessagesNum, totalMessagesNum) {
        if (!this.validateUserGetChat(membersIds, user.friends, user._id)) {
            return errorHandler.promiseSecure("The user: " + user._id +
                " was try to get invalid chat with users ids: " + JSON.stringify(user.friends));
        }

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

        let result = await DAL.aggregate(chatsCollectionName, aggregate)
            .catch(errorHandler.promiseError);

        if (result.length == 0) {
            return null;
        }

        let chat = result[0];
        chat.messages = this.decryptChatMessages(chat.messages);

        return chat;
    },

    async createChat(membersIds) {
        let chatQueryFilter = {
            "membersIds": membersIds
        };

        let chatObj = {
            $set: {
                "membersIds": membersIds,
                "messages": []
            }
        };

        let updateResult = await DAL.updateOne(chatsCollectionName, chatQueryFilter, chatObj, true)
            .catch(errorHandler.promiseError);

        return !!updateResult;
    },

    async addMessageToChat(msgData) {
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

        let updateResult = await DAL.updateOne(chatsCollectionName, chatFilter, chatUpdateQuery)
            .catch(errorHandler.promiseError);

        return !!updateResult;
    },

    decryptChatMessages(messages) {
        messages.forEach(msgData => {
            msgData.text = encryption.decrypt(msgData.text);
        });

        return messages;
    },

    validateUserGetChat(membersIds, userFriends, userId) {
        // Return true if all chat members are the user or his friends, else false.
        return membersIds.every(chatMemberId => {
            return (userFriends.indexOf(chatMemberId) != -1 || chatMemberId == userId)
        });
    },

    async getAllPreviewChats(userId) {
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

        let chats = await DAL.aggregate(chatsCollectionName, aggregateArray)
            .catch(errorHandler.promiseError);

        let indexChatPositionByFriendId = {};
        let chatsFriendsIds = [];

        // Decode last message text for all chats.
        chats.forEach((chat, index) => {
            chat.lastMessage.text = encryption.decrypt(chat.lastMessage.text);

            let friendId = chat.membersIds.find(id => {
                return (id != userId);
            });

            indexChatPositionByFriendId[friendId] = index;
            chatsFriendsIds.push(friendId);
        });

        let friends = await navbarBL.getFriends(chatsFriendsIds)
            .catch(errorHandler.promiseError);

        friends.forEach(friend => {
            let friendId = friend._id.toString();
            chats[indexChatPositionByFriendId[friendId]].friend = friend;
        });

        return chats;
    }
};