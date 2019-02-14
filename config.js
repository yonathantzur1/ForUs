const isServerProd = (process.env.IS_PROD == 'true');
const serverPort = process.env.PORT || 8000;

module.exports = {
    server: {
        port: serverPort,
        isProd: isServerProd,
        isForceHttps: true // For not localhost environment
    },
    address: {
        site: isServerProd ? "https://forus.herokuapp.com" : "http://localhost:" + serverPort
    },
    mailer: {
        mail: "forus@mailer.com",
        apiKeyCode: process.env.MAIL_KEY_CODE        
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
            secret: process.env.JWT_SECRET,
            options: { expiresIn: '90d' }
        },
        encrypt: {
            secret: process.env.ENCRYPT_SECRET,
            algorithm: "aes192"
        },
        token: {
            cookieName: "tk",
            uidCookieName: "uid",
            maxAge: 7776000000 // (90 * 24 * 60 * 60 * 1000) - 90 days
        },
        expressBrute: {
            freeRetries: 8,
            minWait: 60000, // (1 * 60 * 1000) - 1 minutes 
            maxWait: 600000 // (10 * 60 * 1000) - 10 minutes 
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
            tokenNumOfHoursValid: 1
        }
    },
    socket: {
        cleanDisconnectUsersIntervalTime: 6, // seconds
        maxLastKeepAliveDelay: 5 // seconds
    }
};