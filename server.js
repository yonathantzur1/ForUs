const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const http = require('http').Server(app);
const path = require('path');
const compression = require('compression');
const io = require('socket.io')(http);
const general = require('./modules/general');
const config = require('./modules/config');

// app define
app.set('trust proxy', 1);
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({
    limit: '10mb',
    extended: true
}));
app.use(express.static('./'));
app.use(express.static('public'));
app.use(compression());

// BL requires
const loginBL = require('./modules/BL/loginBL');

function RedirectToLogin(req, res) {
    if (req.method == "GET") {
        general.DeleteAuthCookies(res);
        res.redirect('/login');
    }
    else {
        res.status(401).end();
    }
}

app.use('/api', (req, res, next) => {
    var token = general.DecodeToken(general.GetTokenFromRequest(req));
    var cookieUid = general.GetUidFromRequest(req);

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
    var token = general.DecodeToken(general.GetTokenFromRequest(req));

    if (!token) {
        next();
    }
    else {
        res.redirect('/');
    }
});

http.listen((process.env.PORT || config.server.port), () => {
    console.log("Server is up!");
});

// Import socket.io mudule
var connectedUsers = require('./modules/sockets/socket')(io);

// Routes requires
require('./modules/routes/auth')(app, connectedUsers);
require('./modules/routes/login')(app);
require('./modules/routes/profile')(app);
require('./modules/routes/profilePicture')(app);
require('./modules/routes/navbar')(app);
require('./modules/routes/chat')(app);
require('./modules/routes/chatsWindow')(app);
require('./modules/routes/friendRequestsWindow')(app);
require('./modules/routes/management')(app);
require('./modules/routes/statistics')(app);
require('./modules/routes/permissionsCard')(app);
require('./modules/routes/userPage')(app);
require('./modules/routes/userEditWindow')(app);

// Import server jobs and scripts.
require('./modules/schedules')(connectedUsers);
require('./modules/scripts')();

// Redirect angular requests back to client side.
app.get('**', (req, res) => {
    res.sendFile(path.join(__dirname + '/index.html'));
});