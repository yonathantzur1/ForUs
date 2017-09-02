var url = 'mongodb://forusdb:Aa123456@ds145293.mlab.com:45293/forus';
var maxPoolSize = 10;

module.exports = {
    connectionString: url + '?' + 'maxPoolSize=' + maxPoolSize,
    jwtSecret: "pingpong",
    jwtOptions: { expiresIn: '48h' },
    encryptSecret : "zigzag",
    encryptAlgorithm : "aes-256-ctr"
};