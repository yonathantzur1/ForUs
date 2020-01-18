const isServerProd = (process.env.IS_PROD == 'true');
const serverPort = process.env.PORT || 8000;
const clientPort = 4200;

module.exports = {
    server: {
        port: serverPort,
        isProd: isServerProd,
        maxRequestSize: '10mb',
        isForceHttps: true // (for production environment)
    },
    address: {
        site: isServerProd ? "https://forus.herokuapp.com" : ("http://localhost:" + clientPort)
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
            profilePictures: "ProfilePictures",
            chats: "Chats",
            permissions: "Permissions",
            logs: "Logs",
            reportReasons: "ReportReasons",
            usersReports: "UsersReports"
        }
    },
    logs: {
        directoryName: "/logs",
        mainLogName: "forus.log",
        secureLogName: "secure.log",
        maxLogSize: 5000000, // bytes
        maxLogFiles: 3
    },
    security: {
        jwt: {
            secret: process.env.FORUS_JWT_SECRET,
            options: { expiresIn: '90d' } // 90 days
        },
        encrypt: {
            algorithm: "aes192",
            secret: process.env.FORUS_ENCRYPT_SECRET,
            salt: process.env.FORUS_ENCRYPT_SALT
        },
        token: {
            cookieName: "tk",
            uidCookieName: "uid",
            maxAge: 90 * 24 * 60 * 60 * 1000 // 90 days
        },
        limitter: {
            freeRetries: 5,
            waitTime: 1 * 60 * 1000, // 1 minutes
        },
        password: {
            saltSize: 8,
            resetCode: {
                numOfDigits: 6,
                freeRetries: 3
            }
        },
        ttl: {
            resetPasswordCode: 24, // hours
            deleteUserToken: 1 // hour
        }
    },
    socket: {
        keepAlive: 20 // seconds
    }
};