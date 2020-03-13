const permissionsMiddleware = require('../middlewares/permissionsMiddleware');

module.exports = (app, connectedUsers) => {
    // Validate user token for each api request.
    app.use('/api', Exclude([
        '/login/*',
        '/register/*',
        '/forgotPassword/*',
        '/deleteUser/*',
        '/auth/isUserOnSession',
        '/auth/isUserSocketConnect'
    ], permissionsMiddleware.auth));

    app.use('/api/login', require('./welcome/login'));
    app.use('/api/register', require('./welcome/register'));
    app.use('/api/forgotPassword', require('./welcome/forgotPassword'));
    app.use('/api/deleteUser', require('./deleteUser'));
    app.use('/api/navbar', require('./navbar'));
    app.use('/api/home', require('./home'));
    app.use('/api/chat', require('./chat'));
    app.use('/api/profilePicture', require('./profilePicture'));
    app.use('/api/userPage', require('./userPage/userPage'));
    app.use('/api/userEditWindow', require('./userPage/userEditWindow'));
    app.use('/api/userReportWindow', require('./userPage/userReportWindow'));
    app.use('/api/userPasswordWindow', require('./userPage/userPasswordWindow'));
    app.use('/api/userPrivacyWindow', require('./userPage/userPrivacyWindow'));
    app.use('/api/searchPage', require('./searchPage'));
    app.use('/api/management', permissionsMiddleware.root, require('./managementPanel/management'));
    app.use('/api/statistics', permissionsMiddleware.root, require('./managementPanel/statistics'));
    app.use('/api/usersReports', permissionsMiddleware.root, require('./managementPanel/usersReports'));
    app.use('/api/permissions', permissionsMiddleware.master, require('./managementPanel/permissions'));

    app.use('/api/auth', (req, res, next) => {
        req.connectedUsers = connectedUsers;
        next();
    }, require('./auth'));
}

// Exclude routes for middlewares.
function Exclude(paths, middleware) {
    return (req, res, next) => {
        for (let i = 0; i < paths.length; i++) {
            let path = paths[i];
            let reqUrl = req.path;
            let generalPathPosition = path.indexOf('/*');
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