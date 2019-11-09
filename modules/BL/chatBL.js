const DAL = require('../DAL.js');
const config = require('../../config');
const encryption = require('../security/encryption');
const navbarBL = require('./navbarBL');

const errorHandler = require('../handlers/errorHandler');

const chatsCollectionName = config.db.collections.chats;
const messagesInPage = 40;

module.exports = {
    async getChat(members, user) {
        if (!this.validateChatMembers(members, user.friends, user._id)) {
            return errorHandler.promiseSecure("The user: " + user._id +
                " was try to get invalid chat with users ids: " + JSON.stringify(user.friends));
        }

        members = DAL.getArrayObjectId(members);

        let chatQueryFilter = {
            $match: {
                "members": { $all: members }
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
            let createChatResult = await this.createChat(members)
                .catch(errorHandler.promiseError);

            if (!createChatResult) {
                return errorHandler.promiseError("Failed to create new chat of members: " +
                    JSON.stringify(members));
            }

            return false;
        }

        let chat = result[0];
        chat.messages = this.decryptChatMessages(chat.messages);

        return chat;
    },

    async getChatPage(members, user, currMessagesNum, totalMessagesNum) {
        if (!this.validateChatMembers(members, user.friends, user._id)) {
            return errorHandler.promiseSecure("The user: " + user._id +
                " was try to get invalid chat with users ids: " + JSON.stringify(user.friends));
        }

        members = DAL.getArrayObjectId(members);

        let chatQueryFilter = {
            $match: {
                "members": { $all: members }
            }
        };

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

        let chat = result[0];
        chat.messages = this.decryptChatMessages(chat.messages);

        return chat;
    },

    async createChat(members) {
        let chatQueryFilter = {
            "members": members
        };

        let chatObj = {
            $set: {
                "members": members,
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

        let chatFilter = {
            "members": {
                $all: DAL.getArrayObjectId([msgData.from, msgData.to])
            }
        };

        // Build message object to save on DB.
        let message = {
            id: msgData.id,
            from: DAL.getObjectId(msgData.from),
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

    validateChatMembers(members, userFriends, userId) {
        // Return true if all chat members are the user or his friends, else false.
        return members.every(id => {
            return (userFriends.includes(id.toString()) || id.toString() == userId);
        });
    },

    async getAllPreviewChats(userId) {
        let chatsFilter = {
            $match: {
                "members": DAL.getObjectId(userId),
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
                    members: "$members"
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

            let friendId = chat.members.find(id => {
                return (id.toString() != userId);
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