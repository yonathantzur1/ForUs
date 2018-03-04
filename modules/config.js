module.exports = {
    addresses: {
        site: "https://forus.herokuapp.com",
        mail: "forusmailer@gmail.com",
        mainConnectionString: "smtps://forusmailer%40gmail.com:popCorn1@smtp.gmail.com"
    },
    db: {
        dbName: "forus",
        connectionString: 'mongodb://forusdb:Aa123456@forus-shard-00-00-fenaf.mongodb.net:27017,forus-shard-00-01-fenaf.mongodb.net:27017,forus-shard-00-02-fenaf.mongodb.net:27017/test?ssl=true&replicaSet=ForUs-shard-0&authSource=admin&maxPoolSize=100',
        maxConnectionAttemptsNumber: 5
    },
    jwt: {
        secret: "pingpong",
        options: { expiresIn: '90d' }
    },
    encrypt: {
        secret: "zigzag",
        algorithm: "aes192"
    },
    expressBrute: {
        freeRetries: 8,
        minWait: 60000, // (1 * 60 * 1000) - 1 minutes 
        maxWait: 600000 // (10 * 60 * 1000) - 10 minutes 
    },
    token: {
        cookieName: "tk",
        userIdCookieName: "ui",
        maxAge: 7776000000 // (90 * 24 * 60 * 60 * 1000) - 90 days
    },
    loginSecure: {
        saltNumOfDigits: 8,
        resetCodeNumOfDigits: 6,
        resetCodeNumOfHoursValid: 24,
        resetPasswordMaxTries: 3
    },
    chat: {
        messagesInPage: 50
    }
};