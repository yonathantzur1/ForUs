var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var http = require('http').Server(app);
var path = require('path');
var compression = require('compression');
var io = require('socket.io')(http);
var general = require('./modules/general');

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
var loginBL = require('./modules/BL/loginBL.js');

function RedirectToLogin(req, res) {
    if (req.method == "GET") {
        res.redirect('/login');
    }
    else {
        res.status(401).end();
    }
}

app.use('/api', function (req, res, next) {
    var token = general.DecodeToken(general.GetTokenFromRequest(req));

    if (!token) {
        RedirectToLogin(req, res);
    }
    else {
        if (req.originalUrl == '/api/auth/isUserOnSession') {
            loginBL.GetUserById(token.user._id, function (user) {
                if (user) {
                    req.user = user;
                    next();
                }
                else {
                    RedirectToLogin(req, res);
                }
            });
        }
        else {
            req.user = token.user;
            next();
        }
    }
});

http.listen((process.env.PORT || 8000), function () {
    console.log("Server is up!");
});

app.get('/login', function (req, res, next) {
    var token = general.DecodeToken(general.GetTokenFromRequest(req));

    if (!token) {
        next();
    }
    else {
        res.redirect('/');
    }
});

// Routes requires
require('./routes/auth.js')(app);
require('./routes/login.js')(app);
require('./routes/profile.js')(app);
require('./routes/profilePicture.js')(app);
require('./routes/navbar.js')(app);
require('./routes/chat.js')(app);
require('./routes/unreadWindow.js')(app);
require('./routes/management.js')(app);

// Import socket.io mudule
require('./modules/sockets/socket.js')(io);

// Redirect angular requests back to client side.
app.get('**', function (req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});