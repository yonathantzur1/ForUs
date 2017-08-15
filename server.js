var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var path = require('path');
var mailer = require('./modules/mailer.js');
var sha512 = require('js-sha512');
var jwt = require('jsonwebtoken');
var config = require('./modules/config.js');

// BL requires
var loginBL = require('./modules/BL/loginBL.js');
var homeBL = require('./modules/BL/homeBL.js');
var profileBL = require('./modules/BL/profileBL.js');
var profilePictureBL = require('./modules/BL/profilePictureBL.js');
var navbarBL = require('./modules/BL/navbarBL.js');

app.set('trust proxy', 1);
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({
    limit: '10mb',
    extended: true
}));
app.use(express.static('./'));
app.use(express.static('public'));

function redirectToLogin(req, res) {
    if (req.method == "GET") {
        res.redirect('/login');
    }
    else {
        res.status(401).send();
    }
}

app.use('/api', function (req, res, next) {
    var token = getCookieFromReq('tk', req.headers.cookie);

    if (!token) {
        redirectToLogin(req, res);
    }
    else {
        jwt.verify(token, config.jwtSecret, function (err, decoded) {
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

var server = app.listen((process.env.PORT || 8000), function () {
    console.log("Server is up!");
});

require('./routes/auth.js')(app);
require('./routes/login.js')(app, loginBL, mailer, sha512);
require('./routes/profile.js')(app, profileBL);
require('./routes/profilePicture.js')(app, profilePictureBL);
require('./routes/navbar.js')(app, navbarBL);

app.get('/login', function (req, res, next) {
    var token = getCookieFromReq('tk', req.headers.cookie);

    if (!token) {
        next();
    }
    else {
        jwt.verify(token, config.jwtSecret, function (err, decoded) {
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

function getCookieFromReq(cname, decodedCookie) {
    if (!decodedCookie) {
        return "";
    }

    var name = cname + "=";
    var ca = decodedCookie.split(';');

    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];

        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }

        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }

    return "";
}