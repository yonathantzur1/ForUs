const DAL = require('../DAL.js');
const config = require('../config');
const encryption = require('../encryption');

const collectionName = config.db.collections.chats;

var self = module.exports = {
    GetChat: (membersIds, user) => {
        return new Promise((resolve, reject) => {
            if (ValidateUserGetChat(membersIds, user.friends, user._id)) {
                var chatQueryFilter = {
                    $match: {
                        "membersIds": { $all: membersIds }
                    }
                }

                var sliceObj = {
                    $project: {
                        messages: { $slice: ["$messages", -1 * config.chat.messagesInPage] },
                        totalMessagesNum: { $size: "$messages" }
                    }
                }

                var aggregate = [chatQueryFilter, sliceObj];

                DAL.Aggregate(collectionName, aggregate).then((result) => {
                    var chat;

                    // In case the chat is not exists.
                    if (result.length == 0) {
                        chat = false;
                        self.CreateChat(membersIds);
                    }
                    else {
                        chat = result[0];
                        chat.messages = DecryptChatMessages(chat.messages);
                    }

                    resolve(chat);
                }).catch(reject);
            }
            else {
                resolve(null);
            }
        });
    },

    GetChatPage: (membersIds, user, currMessagesNum, totalMessagesNum) => {
        return new Promise((resolve, reject) => {
            if (ValidateUserGetChat(membersIds, user.friends, user._id)) {
                var chatQueryFilter = {
                    $match: {
                        "membersIds": { $all: membersIds }
                    }
                }

                var messagesInPage = config.chat.messagesInPage;
                var page = (currMessagesNum / messagesInPage) + 1;
                var selectNextNumber = Math.min(messagesInPage, (totalMessagesNum - currMessagesNum));

                var sliceObj = {
                    $project: {
                        messages: { $slice: ["$messages", (-1 * messagesInPage * page), selectNextNumber] }
                    }
                }

                var aggregate = [chatQueryFilter, sliceObj];

                DAL.Aggregate(collectionName, aggregate).then((result) => {
                    var chat;

                    if (result.length != 0) {
                        chat = result[0];
                        chat.messages = DecryptChatMessages(chat.messages);
                    }

                    resolve(chat);
                }).catch(reject);
            }
            else {
                resolve(null);
            }
        });
    },

    CreateChat: (membersIds) => {
        var chatQueryFilter = {
            "membersIds": { $all: membersIds }
        }

        var chatObj = {
            "membersIds": membersIds,
            "messages": []
        }

        DAL.UpdateOne(collectionName, chatQueryFilter, chatObj, true).then((result) => { }).catch((error) => {
            // TODO: error log.
        });
    },

    AddMessageToChat: (msgData) => {
        return new Promise((resolve, reject) => {
            // Encrypt message text.
            msgData.text = encryption.encrypt(msgData.text);

            var membersIds = [msgData.from, msgData.to];
            var chatFilter = { "membersIds": { $all: membersIds } }

            var chatUpdateQuery = {
                $push: { "messages": msgData },
                $set: { "lastMessage": { "text": (msgData.isImage ? "" : msgData.text), "time": msgData.time, "isImage": (msgData.isImage ? true : false) } }
            }

            DAL.UpdateOne(collectionName, chatFilter, chatUpdateQuery).then((result) => {
                result ? resolve(true) : resolve(false);
            }).catch(reject);
        });
    },

    GetAllEmptyChats: () => {
        return new Promise((resolve, reject) => {
            var chatFields = { "membersIds": 1 };

            DAL.FindSpecific(collectionName, { "messages": { $size: 0 } }, chatFields)
                .then(resolve).catch(reject);
        });
    },

    RemoveChatsByIds: (ids) => {
        return new Promise((resolve, reject) => {
            DAL.Delete(collectionName, { "_id": { $in: ids } }).then(resolve).catch(reject);
        });
    }
}

function ValidateUserGetChat(membersIds, userFriends, userId) {
    for (var i = 0; i < membersIds.length; i++) {
        if (userFriends.indexOf(membersIds[i]) == -1 && membersIds[i] != userId) {
            return false;
        }
    }

    return true;
}

function DecryptChatMessages(messages) {
    messages.forEach((msgData) => {
        msgData.text = encryption.decrypt(msgData.text);
    });

    return messages;
}