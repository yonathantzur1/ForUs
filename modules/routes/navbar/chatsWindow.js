const chatsWindowBL = require('../../BL/navbar/chatsWindowBL');
const logger = require('../../../logger');

let prefix = "/api/chatsWindow";

module.exports = function (app) {    
    // Get all not empty chats order by last message time.
    app.get(prefix + '/getAllChats', function (req, res) {
        chatsWindowBL.GetAllChats(req.user._id).then((chats) => {
            res.send(chats);
        }).catch((err) => {
            logger.error(err);
            res.sendStatus(500);
        });
    });
};