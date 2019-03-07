const DAL = require('../DAL.js');
const config = require('../../config');
const encryption = require('../security/encryption');
const logger = require('../../logger');

const collectionName = config.db.collections.chats;
const messagesInPage = 40;

let self = module.exports = {
    GetChat(membersIds, user) {
        return new Promise((resolve, reject) => {
            if (self.ValidateUserGetChat(membersIds, user.friends, user._id)) {
                let chatQueryFilter = {
                    $match: {
                        "membersIds": { $all: membersIds }
                    }
                }

                let sliceObj = {
                    $project: {
                        messages: { $slice: ["$messages", -1 * messagesInPage] },
                        totalMessagesNum: { $size: "$messages" }
                    }
                }

                let aggregate = [chatQueryFilter, sliceObj];

                DAL.Aggregate(collectionName, aggregate).then((result) => {
                    let chat;

                    // In case the chat is not exists.
                    if (result.length == 0) {
                        chat = false;
                        self.CreateChat(membersIds);
                    }
                    else {
                        chat = result[0];
                        chat.messages = self.DecryptChatMessages(chat.messages);
                    }

                    resolve(chat);
                }).catch(reject);
            }
            else {
                resolve(null);
            }
        });
    },

    GetChatPage(membersIds, user, currMessagesNum, totalMessagesNum) {
        return new Promise((resolve, reject) => {
            if (self.ValidateUserGetChat(membersIds, user.friends, user._id)) {
                let chatQueryFilter = {
                    $match: {
                        "membersIds": { $all: membersIds }
                    }
                }

                let messagesInPage = messagesInPage;
                let page = (currMessagesNum / messagesInPage) + 1;
                let selectNextNumber = Math.min(messagesInPage, (totalMessagesNum - currMessagesNum));

                let sliceObj = {
                    $project: {
                        messages: { $slice: ["$messages", (-1 * messagesInPage * page), selectNextNumber] }
                    }
                }

                let aggregate = [chatQueryFilter, sliceObj];

                DAL.Aggregate(collectionName, aggregate).then((result) => {
                    let chat;

                    if (result.length != 0) {
                        chat = result[0];
                        chat.messages = self.DecryptChatMessages(chat.messages);
                    }

                    resolve(chat);
                }).catch(reject);
            }
            else {
                resolve(null);
            }
        });
    },

    CreateChat(membersIds) {
        let chatQueryFilter = {
            "membersIds": membersIds
        }

        let chatObj = {
            $set: {
                "membersIds": membersIds,
                "messages": []
            }
        }

        DAL.UpdateOne(collectionName, chatQueryFilter, chatObj, true).catch(logger.error);
    },

    AddMessageToChat(msgData) {
        return new Promise((resolve, reject) => {
            // Encrypt message text.
            msgData.text = encryption.encrypt(msgData.text);

            let chatFilter = { "membersIds": { $all: [msgData.from, msgData.to] } };
            let chatUpdateQuery = {
                $push: { "messages": msgData }
            }

            DAL.UpdateOne(collectionName, chatFilter, chatUpdateQuery).then((result) => {
                result ? resolve(true) : resolve(false);
            }).catch(reject);
        });
    },

    GetAllEmptyChats() {
        return new Promise((resolve, reject) => {
            let chatFields = { "membersIds": 1 };

            DAL.FindSpecific(collectionName, { "messages": { $size: 0 } }, chatFields)
                .then(resolve).catch(reject);
        });
    },

    RemoveChatsByIds(ids) {
        return new Promise((resolve, reject) => {
            DAL.Delete(collectionName, { "_id": { $in: ids } }).then(resolve).catch(reject);
        });
    },

    DecryptChatMessages(messages) {
        messages.forEach((msgData) => {
            msgData.text = encryption.decrypt(msgData.text);
        });

        return messages;
    },

    ValidateUserGetChat(membersIds, userFriends, userId) {
        for (let i = 0; i < membersIds.length; i++) {
            if (userFriends.indexOf(membersIds[i]) == -1 && membersIds[i] != userId) {
                return false;
            }
        }

        return true;
    }
}