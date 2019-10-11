const config = require('../config');
const encryption = require('./security/encryption');
const DAL = require('./DAL');

let chatsCollectionName = config.db.collections.chats;

// ---------------- How to use ----------------
// Don't forget to run the function and after it finished,
// **delete** it's call.
module.exports = function () {

};

// ---------------- How to use ----------------
// Run this function with the new encryption key string, **before** changing
// the current key on config or on env-variables.
// After running the function, change the key on env-variables.
function changeEncryptionKeyString(newKeyString) {
    DAL.find(chatsCollectionName, {}).then(chats => {
        console.log("Query " + chats.length + " chats");
        let updates = [];

        chats.forEach(chat => {
            let messages = chat.messages;
            messages.forEach(message => {
                message.text = encryption.encrypt(encryption.decrypt(message.text), newKeyString);
            });

            let chatFindQuery = { "_id": chat._id };
            let updateObj = { $set: { messages } };

            updates.push(DAL.updateOne(chatsCollectionName, chatFindQuery, updateObj));
        });

        Promise.all(updates).then(results => {
            console.log("Changing encryption key string done!")
        }).catch(err => {
            console.error("Error during changing encryption key string: " + err);
        });
    });
}