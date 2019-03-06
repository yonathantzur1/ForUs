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
const enums = require('./modules/enums');

const requestDataSizeLimit = '10mb'

process.on('uncaughtException', function (err) {
    logger.error(err)
});

// app define settings.
config.server.isForceHttps && app.use(secure);
app.set('trust proxy', 1);
app.use(bodyParser.json({ limit: requestDataSizeLimit }));
app.use(bodyParser.urlencoded({
    limit: requestDataSizeLimit,
    extended: true
}));
app.use(express.static('./'));
app.use(express.static('public'));
app.use(compression());

// Implement exclude functions for routes in middlewares.
Exclude = (paths, middleware) => {
    return (req, res, next) => {
        if (paths.indexOf(req.path) != -1) {
            return next();
        }
        else {
            return middleware(req, res, next);
        }
    };
}

app.use('/api', Exclude(['/auth/isUserOnSession', '/auth/isUserSocketConnect'], (req, res, next) => {
    tokenHandler.ValidateUserAuthCookies(req) && next();
}));

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