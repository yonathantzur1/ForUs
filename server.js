const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const http = require('http').Server(app);
const path = require('path');
const compression = require('compression');
const io = require('socket.io')(http);
const tokenHandler = require('./modules/handlers/tokenHandler');
const logger = require('./logger');
const secure = require('ssl-express-www');
const config = require('./config');

process.on('uncaughtException', function (err) {
    logger.error(err)
});

// app define settings.
config.server.isForceHttps && app.use(secure);
app.set('trust proxy', 1);
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({
    limit: '10mb',
    extended: true
}));
app.use(express.static('./'));
app.use(express.static('public'));
app.use(compression());

function RedirectToLogin(req, res) {
    if (req.method == "GET") {
        tokenHandler.DeleteAuthCookies(res);
        res.redirect('/login');
    }
    else {
        res.status(401).end();
    }
}

app.use('/api', (req, res, next) => {
    let token = tokenHandler.DecodeTokenFromRequest(req);
    let cookieUid = tokenHandler.GetUidFromRequest(req);

    // In case the user login and authorized.
    if (token && token.user.uid == cookieUid) {
        req.user = token.user;
        next();
    }
    // In case the user is logout.
    else {
        switch (req.originalUrl) {
            case '/api/auth/isUserOnSession':
                res.send(false);
                break;
            case '/api/auth/isUserSocketConnect':
                res.send("-1");
                break;
            default:
                RedirectToLogin(req, res);
        }
    }
});

app.get('/login', (req, res, next) => {
    let token = tokenHandler.DecodeTokenFromRequest(req);

    if (!token) {
        tokenHandler.DeleteAuthCookies(res);
        next();
    }
    else {
        res.redirect('/');
    }
});

http.listen(config.server.port, () => {
    console.log("Server is up!");
});

// Import socket.io module
let connectedUsers = require('./modules/sockets/socket')(io);

// Routes requires
require('./modules/routes/auth')(app, connectedUsers);
require('./modules/routes/login')(app);
require('./modules/routes/forgotPassword')(app);
require('./modules/routes/deleteUser')(app);
require('./modules/routes/home')(app);
require('./modules/routes/profilePicture/profilePictureEdit')(app);
require('./modules/routes/profilePicture/profilePicture')(app);
require('./modules/routes/navbar/navbar')(app);
require('./modules/routes/chat')(app);
require('./modules/routes/navbar/chatsWindow')(app);
require('./modules/routes/navbar/friendRequestsWindow')(app);
require('./modules/routes/managementPanel/management')(app);
require('./modules/routes/managementPanel/statistics')(app);
require('./modules/routes/managementPanel/usersReports')(app);
require('./modules/routes/managementPanel/permissions')(app);
require('./modules/routes/userPage/userPage')(app);
require('./modules/routes/userPage/userEditWindow')(app);
require('./modules/routes/userPage/userReportWindow')(app);
require('./modules/routes/userPage/userPasswordWindow')(app);
require('./modules/routes/userPage/userPrivacyWindow')(app);
require('./modules/routes/searchPage')(app);

// Import server jobs and scripts.
require('./modules/schedules')(connectedUsers);
require('./modules/scripts')();

// Redirect angular requests back to client side.
app.get('**', (req, res) => {
    res.sendFile(path.join(__dirname + '/index.html'));
});