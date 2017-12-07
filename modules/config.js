module.exports = {
    db: {
        dbName: "forus",
        connectionString: 'mongodb://forusdb:Aa123456@ds159274.mlab.com:59274/forus?maxPoolSize=10',
        maxConnectionAttemptsNumber: 5
    },
    jwt: {
        secret: "pingpong",
        options: { expiresIn: '48h' }
    },
    encrypt: {
        secret: "zigzag",
        algorithm: "aes192"
    },
    expressBrute: {
        minWait: 1 * 60 * 1000, // 1 minutes 
        maxWait: 5 * 60 * 1000 // 5 minutes 
    },
    token: {
        cookieName: "tk",
        maxAge: 48 * 60 * 60 * 1000 // 2 days
    }
};