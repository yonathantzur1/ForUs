const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const http = require('http').Server(app);
const secure = require('ssl-express-www');
const path = require('path');
const compression = require('compression');
const io = require('socket.io')(http);
const tokenHandler = require('./modules/handlers/tokenHandler');
const permissionHandler = require('./modules/handlers/permissionHandler');
const config = require('./config');
const logger = require('./logger');
const requestDataSizeLimit = '10mb';

process.on('uncaughtException', (err) => {
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
app.use(express.static('public'));
app.use(compression());

//#region Middlewares
// Exclude routes for middlewares.
function Exclude(paths, middleware) {
    return (req, res, next) => {
        for (let i = 0; i < paths.length; i++) {
            let path = paths[i];
            let reqUrl = req.path;
            let generalPathPosition = path.indexOf("/*");
            let isExcludeMath;

            //  In case the path is general and ends with /*
            if (generalPathPosition != -1) {
                path = path.substring(0, generalPathPosition);
                isExcludeMath = (reqUrl.indexOf(path) == 0);
            }
            else {
                isExcludeMath = (path == reqUrl);
            }

            // In case the exclude path is match to req path.
            if (isExcludeMath) {
                return next();
            }
        }

        return middleware(req, res, next);
    };
}

// Validation root permissions.
function CheckRootPermission(req, res, next) {
    permissionHandler.IsUserHasRootPermission(req.user.permissions) ?
        next() : res.status(401).end();
}

// Validation master permissions.
function CheckMasterPermission(req, res, next) {
    permissionHandler.IsUserHasMasterPermission(req.user.permissions) ?
        next() : res.status(401).end();
}
//#endregion

// Validate user token for each api request.
app.use('/api', Exclude([
    '/login/*',
    '/forgotPassword/*',
    '/deleteUser/*',
    '/auth/isUserOnSession',
    '/auth/isUserSocketConnect'
], (req, res, next) => {
    tokenHandler.ValidateUserAuthCookies(req) && next();
}));

// Import socket module and get the connected users object.
let connectedUsers = require('./modules/sockets/socket')(io);

//#region routes
app.use("/api/login", require('./modules/routes/login'));
app.use("/api/forgotPassword", require('./modules/routes/forgotPassword'));
app.use("/api/deleteUser", require('./modules/routes/deleteUser'));
app.use("/api/navbar", require('./modules/routes/navbar'));
app.use("/api/home", require('./modules/routes/home'));
app.use("/api/chat", require('./modules/routes/chat'));
app.use("/api/profilePicture", require('./modules/routes/profilePicture'));
app.use("/api/userPage", require('./modules/routes/userPage/userPage'));
app.use("/api/userEditWindow", require('./modules/routes/userPage/userEditWindow'));
app.use("/api/userReportWindow", require('./modules/routes/userPage/userReportWindow'));
app.use("/api/userPasswordWindow", require('./modules/routes/userPage/userPasswordWindow'));
app.use("/api/userPrivacyWindow", require('./modules/routes/userPage/userPrivacyWindow'));
app.use("/api/searchPage", require('./modules/routes/searchPage'));
app.use("/api/management", CheckRootPermission, require('./modules/routes/managementPanel/management'));
app.use("/api/statistics", CheckRootPermission, require('./modules/routes/managementPanel/statistics'));
app.use("/api/usersReports", CheckRootPermission, require('./modules/routes/managementPanel/usersReports'));
app.use("/api/permissions", CheckMasterPermission, require('./modules/routes/managementPanel/permissions'));

app.use("/api/auth", (req, res, next) => {
    req.connectedUsers = connectedUsers;
    next();
}, require('./modules/routes/auth'));
//#endregion

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
    let filePath;

    if (allowedExt.filter(ext => req.url.indexOf(ext) > 0).length > 0) {
        filePath = path.resolve('dist/' + req.url);
    }
    else {
        filePath = path.resolve('dist/index.html');
    }

    res.sendFile(filePath);
});

http.listen(config.server.port, () => {
    console.log("Server is up!");
});