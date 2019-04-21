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
const speedLimiter = require('./modules/security/speedLimiter');
const ddos = require('./modules/security/ddos');
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
app.use(speedLimiter);
app.use(ddos);

//#region Middlewares
// Exclude routes for middlewares.
function Exclude(paths, middleware) {
    return (req, res, next) => {
        if (paths.indexOf(req.path) != -1) {
            return next();
        }
        else {
            return middleware(req, res, next);
        }
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
app.use('/api', Exclude(['/auth/isUserOnSession', '/auth/isUserSocketConnect'], (req, res, next) => {
    tokenHandler.ValidateUserAuthCookies(req) && next();
}));

// Import socket module and get the connected users object.
let connectedUsers = require('./modules/sockets/socket')(io);

//#region routes
app.use("/login", require('./modules/routes/login'));
app.use("/forgotPassword", require('./modules/routes/forgotPassword'));
app.use("/deleteUser", require('./modules/routes/deleteUser'));
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

app.use("/api/management", CheckRootPermission,
    require('./modules/routes/managementPanel/management'));

app.use("/api/statistics", CheckRootPermission,
    require('./modules/routes/managementPanel/statistics'));

app.use("/api/usersReports", CheckRootPermission,
    require('./modules/routes/managementPanel/usersReports'));

app.use("/api/permissions", CheckMasterPermission,
    require('./modules/routes/managementPanel/permissions'));

app.use("/api/auth", (req, res, next) => {
    req.connectedUsers = connectedUsers;
    next();
}, require('./modules/routes/auth'));
//#endregion

// Import server jobs and scripts.
require('./modules/schedules')();
require('./modules/scripts')();

// Redirect angular requests back to client side.
app.get('**', (req, res) => {
    res.sendFile(path.join(__dirname + '/index.html'));
});

http.listen(config.server.port, () => {
    console.log("Server is up!");
});