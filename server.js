const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const http = require('http').Server(app);
const secure = require('ssl-express-www');
const path = require('path');
const compression = require('compression');
const io = require('socket.io')(http);
const config = require('./config');
const logger = require('./logger');
const requestDataSizeLimit = '8mb';

process.on('uncaughtException', err => {
    logger.error(err)
});

process.on('unhandledRejection', err => {
    logger.error(err)
});

// app define settings.
config.server.isForceHttps && app.use(secure);
app.enable('trust proxy');
app.use(bodyParser.json({ limit: requestDataSizeLimit }));
app.use(bodyParser.urlencoded({
    limit: requestDataSizeLimit,
    extended: true
}));
app.use(express.static('./'));
app.use(compression());

// Import socket module and get the connected users object.
let connectedUsers = require('./modules/sockets/socket')(io);

// Import routes.
require('./modules/routes/main')(app, connectedUsers);

// Import server jobs and scripts.
require('./modules/schedules')();
require('./modules/scripts')();

// Allowed extensions list.
const allowedExt = [
    '.js',
    '.ico',
    '.css',
    '.png',
    '.jpg',
    '.woff2',
    '.woff',
    '.ttf',
    '.svg',
];

// Redirect angular requests back to client side.
app.get('/*', (req, res) => {
    let buildFolder = 'dist/';
    let filePath;

    if (allowedExt.filter(ext => req.url.indexOf(ext) > 0).length > 0) {
        filePath = path.resolve(buildFolder + req.url);
    }
    else {
        filePath = path.resolve(buildFolder + 'index.html');
    }

    res.sendFile(filePath);
});

http.listen(config.server.port, () => {
    console.log("Server is up!");
});