var DAL = require('../DAL.js');
var jwt = require('jsonwebtoken');
var config = require('../config.js');
var encryption = require('../encryption.js');

var collectionName = "Chats";

var self = module.exports = {
    GetChat: function (membersIds, token, callback) {
        jwt.verify(token, config.jwtSecret, function (err, decoded) {
            if (!err && decoded && ValidateUserGetChat(membersIds, decoded.user.friends, decoded.user._id)) {
                for (var i = 0; i < membersIds.length; i++) {
                    membersIds[i] = DAL.GetObjectId(membersIds[i]);
                }

                var chatQueryFilter = {
                    "membersIds": { $in: membersIds },
                    "membersIds": { $size: membersIds.length }
                }

                DAL.FindOne(collectionName, chatQueryFilter, function (chat) {
                    if (!chat) {
                        self.CreateChat(membersIds);
                    }
                    else {
                        chat.messages = DecryptChatMessages(chat.messages);
                    }

                    callback(chat);
                })
            }
            else {
                callback(null);
            }
        });
    },

    CreateChat: function (membersIds) {
        var chatObj = {
            "membersIds": membersIds,
            "messages": []
        }

        DAL.Insert(collectionName, chatObj, function () { });
    },

    AddMessageToChat: function (msgData) {
        // Encrypt message text.
        msgData.text = encryption.encrypt(msgData.text);

        var membersIds = [DAL.GetObjectId(msgData.from), DAL.GetObjectId(msgData.to)];
        var chatFilter = {
            "membersIds": { $in: membersIds },
            "membersIds": { $size: membersIds.length }
        }

        var chatUpdateQuery = { $push: { "messages": msgData } }

        DAL.UpdateOne(collectionName, chatFilter, chatUpdateQuery, function (result) { });
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