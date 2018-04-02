const DAL = require('../DAL.js');
const config = require('../config');
const general = require('../general');
const encryption = require('../encryption');
const jwt = require('jsonwebtoken');

const collectionName = config.db.collections.chats;

var self = module.exports = {
    GetChat: function (membersIds, token, callback) {
        token = general.DecodeToken(token);

        if (token && ValidateUserGetChat(membersIds, token.user.friends, token.user._id)) {
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

            DAL.Aggregate(collectionName, aggregate, function (result) {
                var chat;

                if (!result || result.length == 0) {
                    self.CreateChat(membersIds);
                }
                else {
                    chat = result[0];
                    chat.messages = DecryptChatMessages(chat.messages);
                }

                callback(chat);
            });
        }
        else {
            callback(null);
        }
    },

    GetChatPage: function (membersIds, token, currMessagesNum, totalMessagesNum, callback) {
        token = general.DecodeToken(token);

        if (token && ValidateUserGetChat(membersIds, token.user.friends, token.user._id)) {
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

            DAL.Aggregate(collectionName, aggregate, function (result) {
                var chat;

                if (result && result.length != 0) {
                    chat = result[0];
                    chat.messages = DecryptChatMessages(chat.messages);
                }

                callback(chat);
            });
        }
        else {
            callback(null);
        }
    },

    CreateChat: function (membersIds) {
        var chatQueryFilter = {
            "membersIds": { $all: membersIds }
        }

        var chatObj = {
            "membersIds": membersIds,
            "messages": []
        }

        DAL.UpdateOne(collectionName, chatQueryFilter, chatObj, function () { }, true);
    },

    AddMessageToChat: function (msgData, callback) {
        // Encrypt message text.
        msgData.text = encryption.encrypt(msgData.text);

        var membersIds = [msgData.from, msgData.to];
        var chatFilter = { "membersIds": { $all: membersIds } }

        var chatUpdateQuery = {
            $push: { "messages": msgData },
            $set: { "lastMessage": { "text": (msgData.isImage ? "" : msgData.text), "time": msgData.time, "isImage": (msgData.isImage ? true : false) } }
        }

        DAL.UpdateOne(collectionName, chatFilter, chatUpdateQuery, function (result) {
            result ? callback(true) : callback(false);
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
    messages.forEach(function (msgData) {
        msgData.text = encryption.decrypt(msgData.text);
    });

    return messages;
}