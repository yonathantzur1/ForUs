const schedule = require('node-schedule');
const config = require('../config');
const logger = require('./logger');
const chatBL = require('./BL/chatBL');
const DAL = require('./DAL');

const usersCollectionName = config.db.collections.users;

module.exports = (connectedUsers) => {
    // Task for every night at 00:00
    schedule.scheduleJob('0 0 * * *', function () {
        RemoveEmptyChats(connectedUsers);
        ClearEndedBlocksFromUsers();
    });
}

// Remove empty chats objects from logoff users.
function RemoveEmptyChats(connectedUsers) {
    chatBL.GetAllEmptyChats().then((chats) => {
        if (chats) {
            var chatsToRemove = [];

            // Searching for empty chats with offline members.
            chats.forEach(chat => {
                var isAllChatMembersOffline = true;

                // Check if all members of the chat are offline.
                for (var i = 0; i < chat.membersIds.length; i++) {
                    // In case the user is connect to the site.
                    if (connectedUsers[chat.membersIds[i]] != null) {
                        isAllChatMembersOffline = false;
                        break;
                    }
                }

                if (isAllChatMembersOffline) {
                    chatsToRemove.push(chat._id);
                }
            });

            if (chatsToRemove.length > 0) {
                chatBL.RemoveChatsByIds(chatsToRemove).catch(logger.error);
            }
        }
    }).catch(logger.error);
}

// Remove block property from user document if the block was ended.
function ClearEndedBlocksFromUsers() {
    var removeBlockFind = {
        "block.unblockDate": { $exists: true },
        "block.unblockDate": { $lte: new Date() }
    };
    var removeBlockQuery = { $unset: { "block": 1 } };

    DAL.Update(usersCollectionName, removeBlockFind, removeBlockQuery).catch(logger.error);
}