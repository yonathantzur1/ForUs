var url = 'mongodb://forusdb:Aa123456@ds159963.mlab.com:59963/forus';
var maxPoolSize = 10;

module.exports = {
    connectionString: url + '?' + 'maxPoolSize=' + maxPoolSize,
    jwtSecret: "pingpong",
    jwtOptions: { expiresIn: '48h' },
    encryptSecret : "zigzag",
    encryptAlgorithm : "aes-256-ctr"
};