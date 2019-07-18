const isServerProd = (process.env.IS_PROD == 'true');
const serverPort = process.env.PORT || 8000;
const clientPort = 4200;

module.exports = {
    server: {
        port: serverPort,
        isProd: isServerProd,
        isForceHttps: true // (On production environment)
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
            profiles: "Profiles",
            chats: "Chats",
            permissions: "Permissions",
            logs: "Logs",
            reportReasons: "ReportReasons",
            usersReports: "UsersReports"
        }
    },
    logs: {
        directoryName: "/logs"
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
        password: {
            saltSize: 8,
            resetCode: {
                numOfDigits: 6,
                codeTTL: 24, // hours
                freeRetries: 5
            }
        },
        deleteUser: {
            tokenTTL: 1 // hour
        }
    }
};