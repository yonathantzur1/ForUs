var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var mailer = require('./modules/mailer.js');
var sha512 = require('js-sha512');
var jwt = require('jsonwebtoken');
var compression = require('compression');
var config = require('./modules/config.js');
var general = require('./modules/general.js');

// BL requires
var loginBL = require('./modules/BL/loginBL.js');
var homeBL = require('./modules/BL/homeBL.js');
var profileBL = require('./modules/BL/profileBL.js');
var profilePictureBL = require('./modules/BL/profilePictureBL.js');
var navbarBL = require('./modules/BL/navbarBL.js');
var chatBL = require('./modules/BL/chatBL.js');
var unreadWindowBL = require('./modules/BL/unreadWindowBL.js');

app.set('trust proxy', 1);
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({
    limit: '10mb',
    extended: true
}));
app.use(express.static('./'));
app.use(express.static('public'));
app.use(compression());

// Import socket.io mudule
var socket = require('./modules/socket.js')(io, jwt, config);

function redirectToLogin(req, res) {
    if (req.method == "GET") {
        res.redirect('/login');
    }
    else {
        res.status(401).end();
    }
}

app.use('/api', function (req, res, next) {
    var token = general.GetTokenFromRequest(req);

    if (!token) {
        redirectToLogin(req, res);
    }
    else {
        token = general.DecodeToken(token);

        jwt.verify(token, config.jwt.secret, function (err, decoded) {
            if (err || !decoded) {
                redirectToLogin(req, res);
            }
            else {
                if (req.originalUrl == '/api/auth/isUserOnSession') {
                    loginBL.GetUserById(decoded.user._id, function (user) {
                        if (user) {
                            req.user = user;
                            next();
                        }
                        else {
                            redirectToLogin(req, res);
                        }
                    });
                }
                else {
                    req.user = decoded.user;
                    next();
                }
            }
        });
    }
});

http.listen((process.env.PORT || 8000), function () {
    console.log("Server is up!");
});

require('./routes/auth.js')(app, loginBL, general);
require('./routes/login.js')(app, loginBL, mailer, sha512, general);
require('./routes/profile.js')(app, profileBL, general);
require('./routes/profilePicture.js')(app, profilePictureBL);
require('./routes/navbar.js')(app, navbarBL);
require('./routes/chat.js')(app, chatBL);
require('./routes/unreadWindow.js')(app, unreadWindowBL);

app.get('/login', function (req, res, next) {
    var token = general.GetTokenFromRequest(req);

    if (!token) {
        next();
    }
    else {
        token = general.DecodeToken(token);

        jwt.verify(token, config.jwt.secret, function (err, decoded) {
            if (err || !decoded) {
                next();
            }
            else {
                res.redirect('/');
            }
        });
    }
});

// Redirect angular requests back to client side.
app.get('**', function (req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});