const config = require('./config');
const encryption = require('./encryption');
const generator = require('./generator');
const DAL = require('./DAL');

var chatsCollectionName = config.db.collections.chats;

// ---------------- How to use ----------------
// Don't forget to run the function and after it finished,
// **delete** it's call.
module.exports = function () {    
}

// ---------------- How to use ----------------
// Run this function with the new encryption key string, **before** changing
// the current key on config or on env-variables.
// After running the function, change the key on env-variables. 
function ChangeEncryptionKeyString(key) {
    DAL.Find(chatsCollectionName, {}).then(chats => {
        console.log("Query " + chats.length + " chats");

        chats.forEach((chat, index) => {
            chat.lastMessage.text = encryption.encrypt(encryption.decrypt(chat.lastMessage.text), key);

            chat.messages.forEach(message => {
                message.text = encryption.encrypt(encryption.decrypt(message.text), key);
            });

            DAL.Save(chatsCollectionName, chat).then(res => {
                console.log("Success update chat number " + index + " - id: " + chat._id.toString());
            }).catch(err => {
                console.error("Error update chat number " + index + " - id: " + chat._id.toString());
            });
        });
    });
}