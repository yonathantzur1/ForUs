const router = require('express').Router();
const chatBL = require('../BL/chatBL');
const errorHandler = require('../handlers/errorHandler');

// Return the first chat page messages.
router.post('/getChat', (req, res) => {
    chatBL.getChat(req.body.membersIds, req.user).then((chat) => {
        res.send(chat);
    }).catch((err) => {
        errorHandler.routeError(err, res);
    })
});

// Return the requested chat page messages.
router.post('/getChatPage', (req, res) => {
    chatBL.getChatPage(req.body.membersIds,
        req.user,
        req.body.currMessagesNum,
        req.body.totalMessagesNum).then((chat) => {
            res.send(chat);
        }).catch((err) => {
            errorHandler.routeError(err, res);
        })
});

// Get all not empty chats order by last message time.
router.get('/getAllPreviewChats', (req, res) => {
    chatBL.getAllPreviewChats(req.user._id).then((chats) => {
        res.send(chats);
    }).catch((err) => {
        errorHandler.routeError(err, res);
    });
});

module.exports = router;