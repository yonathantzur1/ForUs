const isServerProd = (process.env.IS_PROD == 'true');
const serverPort = process.env.PORT || 8000;

module.exports = {
    server: {
        port: serverPort,
        isProd: isServerProd,
        isForceHttps: true // (On production environment)
    },
    address: {
        site: isServerProd ? "https://forus.herokuapp.com" : ("http://localhost:" + serverPort)
    },
    mailer: {
        mail: "forus@group.com",
        apiKeyCode: process.env.FORUS_MAIL_KEY_CODE
    },
    db: {
        name: "forus",
        connectionString: process.env.DEV_CONNECTION_STRING || process.env.FORUS_CONNECTION_STRING,
        collections: {
            users: "Users",
            profiles: "Profiles",
            chats: "Chats",
            permissions: "Permissions",
            logs: "Logs",
            reportReasons: "ReportReasons",
            usersReports: "UsersReports"
        }
    },
    logs: {
        directoryName: "logs"
    },
    security: {
        jwt: {
            secret: process.env.FORUS_JWT_SECRET,
            options: { expiresIn: '90d' } // 90 days
        },
        encrypt: {
            secret: process.env.FORUS_ENCRYPT_SECRET,
            algorithm: "aes192"
        },
        token: {
            cookieName: "tk",
            uidCookieName: "uid",
            maxAge: 90 * 24 * 60 * 60 * 1000 // 90 days
        },
        limitter: {
            freeRetries: 10,
            waitTime: 2 * 60 * 1000, // 2 minutes
        },
        ddos: {
            burst: 20, // Number of allowable burst requests before the client starts being penalized.
            limit: 30 // Number of maximum counts allowed.
            // If the count exceeds the limit, then the request is denied.
        },
        password: {
            saltSize: 8,
            resetCode: {
                numOfDigits: 6,
                numOfHoursValid: 24,
                freeRetries: 5
            }
        },
        deleteUser: {
            tokenTTL: 1 // hours
        }
    },
    socket: {
        cleanDisconnectUsersIntervalTime: 6, // seconds
        maxLastKeepAliveDelay: 5 // seconds
    }
};