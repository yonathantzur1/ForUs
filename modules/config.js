module.exports = {
    db: {
        dbName: "forus",
        connectionString: 'mongodb://forusdb:Aa123456@ds159274.mlab.com:59274/forus?maxPoolSize=10',
        maxConnectionAttemptsNumber: 5
        
    },
    jwtSecret: "pingpong",
    jwtOptions: { expiresIn: '48h' },
    encryptSecret: "zigzag",
    encryptAlgorithm: "aes192"
};