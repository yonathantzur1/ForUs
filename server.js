var BL = require('./modules/BL.js');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var path = require('path');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static('./'));
app.use(express.static('public'));

var server = app.listen((process.env.PORT || 8000), function() {
    console.log("Server is up!");
});

require('./routes/login.js')(app, BL);

// Redirect angular requests back to client side.
app.get('**', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});