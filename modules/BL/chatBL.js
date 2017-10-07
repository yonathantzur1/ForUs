var DAL = require('../DAL.js');
var jwt = require('jsonwebtoken');
var config = require('../config.js');
var general = require('../general.js');
var encryption = require('../encryption.js');

var collectionName = "Chats";

var self = module.exports = {
    GetChat: function (membersIds, token, callback) {
        token = general.DecodeToken(token);

        jwt.verify(token, config.jwtSecret, function (err, decoded) {
            if (!err && decoded && ValidateUserGetChat(membersIds, decoded.user.friends, decoded.user._id)) {
                var chatQueryFilter = {
                    "membersIds": { $all: membersIds }
                }

                DAL.FindOne(collectionName, chatQueryFilter, function (chat) {
                    if (!chat) {
                        self.CreateChat(membersIds);
                    }
                    else {
                        chat.messages = DecryptChatMessages(chat.messages);
                    }

                    callback(chat);
                });
            }
            else {
                callback(null);
            }
        });
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
            $set: { "lastMessage": { "text": msgData.text, "time": msgData.time } }
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