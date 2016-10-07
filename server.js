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

app.get('/login/:email/:password', function(req, res) {
    var filter = {"email": req.params.email, 'password': req.params.password}; 
    BL.ValidateUser("Users", filter, function(result) {
        // In case of error.
        if (result == null) {
            res.status(500).send();
        }
        else {
            res.send(result)
        }
    });
});

app.post('/Register', function(req, res) {
    var email = {"email": req.body.email};
    
    // Check if the email is exists in the DB.
    BL.CheckIfUserExists("Users", email, function(result) {
        // In case of error.
        if (result == null) {
            res.status(500).send();
        }
        // In case the user is already exists.
        else if (result == true) {
            res.send(false);
        }
        else {
            var newUser = {"name": req.body.name, "email": req.body.email, "password": req.body.password};

            // Add user to DB and return true.
            BL.AddUser("Users", newUser, function(result) {
                // In case of error.
                if (result == null)
                {
                    res.status(500).send();
                }
                else {
                    // Send the new user that added to DB.
                    res.send(result);
                }
            });
        }
    });
});

// Redirect angular requests back to client side.
app.get('**', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});