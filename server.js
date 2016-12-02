var usersBL = require('./modules/usersBL.js');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var path = require('path');
var mailer = require('./modules/mailer.js');
var sha512 = require('js-sha512');
var session = require('express-session');

app.set('trust proxy', 1) // trust first proxy
app.use(session({
    secret: 'forus',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static('./'));
app.use(express.static('public'));

var server = app.listen((process.env.PORT || 8000), function() {
    console.log("Server is up!");
});

require('./routes/login.js')(app, usersBL, mailer, sha512);

app.get('/getCurrUserName', function(req, res) {
    if (req.session.currUser) {
        res.send(req.session.currUser.name);
    }
    else {
        res.send(null);
    }
});

// Redirect angular requests back to client side.
app.get('**', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});