module.exports = {
    addresses: {
        site: "https://forus.herokuapp.com",
        mail: "forusmailer@gmail.com",
        mainConnectionString: process.env.MAIL_CONNECTION_STRING
    },
    db: {
        name: "forus",
        connectionString: process.env.CONNECTION_STRING || process.env.CONNECTION_STRING,
        maxConnectionAttemptsNumber: 5, // In case of failure.
        collections: {
            users: "Users",
            profiles: "Profiles",
            chats: "Chats",
            permissions: "Permissions",
            logs: "Logs"
        }
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
        loginSecure: {
            saltNumOfDigits: 8,
            resetCodeNumOfDigits: 6,
            resetCodeNumOfHoursValid: 24,
            resetPasswordMaxTries: 3
        },
    },
    chat: {
        messagesInPage: 40 // For chat pagination
    },
    navbar: {
        searchResultsLimit: 4,
        messageMailNotificationHoursWaitingDelay: 1
    }
};