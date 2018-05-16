const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const http = require('http').Server(app);
const path = require('path');
const compression = require('compression');
const io = require('socket.io')(http);
const general = require('./modules/general');

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

    if (token && token.user.uid == cookieUid) {
        req.user = token.user;
        next();
    }
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

http.listen((process.env.PORT || 8000), () => {
    console.log("Server is up!");
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

// Import socket.io mudule
var connectedUsers = require('./modules/sockets/socket')(io);

// Routes requires
require('./routes/auth')(app, connectedUsers);
require('./routes/login')(app);
require('./routes/profile')(app);
require('./routes/profilePicture')(app);
require('./routes/navbar')(app);
require('./routes/chat')(app);
require('./routes/chatsWindow')(app);
require('./routes/friendRequestsWindow')(app);
require('./routes/management')(app);
require('./routes/statistics')(app);
require('./routes/permissionsCard')(app);
require('./routes/userPage')(app);

// Import server jobs and scripts.
require('./modules/schedules')(connectedUsers);
require('./modules/scripts')();

// Redirect angular requests back to client side.
app.get('**', (req, res) => {
    res.sendFile(path.join(__dirname + '/index.html'));
});