const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const http = require('http').Server(app);
const path = require('path');
const compression = require('compression');
const io = require('socket.io')(http);
const tokenHandler = require('./modules/handlers/tokenHandler');
const requestHandler = require('./modules/handlers/requestHandler');
const logger = require('./modules/logger')(__dirname);
var secure = require('ssl-express-www');
const config = require('./config');

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
    var token = tokenHandler.DecodeTokenFromRequest(req);
    var cookieUid = tokenHandler.GetUidFromRequest(req);

    // In case the user login and authorized.
    if (token && token.user.uid == cookieUid) {
        req.user = token.user;
        next();
    }
    // In case the user is logout.
    else {
        if (req.originalUrl == '/api/auth/isUserOnSession') {
            res.send(false);
        }
        else if (req.originalUrl == '/api/auth/isUserSocketConnect') {
            res.send("-1");
        }
        else {
            RedirectToLogin(req, res);
        }
    }
});

app.get('/login', (req, res, next) => {
    var token = tokenHandler.DecodeTokenFromRequest(req);

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
var connectedUsers = require('./modules/sockets/socket')(io);

// Routes requires
require('./modules/routes/auth')(app, connectedUsers);
require('./modules/routes/login')(app);
require('./modules/routes/forgotPassword')(app);
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