var url = 'mongodb://forusdb:Aa123456@ds133044.mlab.com:33044/forus';
var maxPoolSize = 10;

module.exports = {
    connectionString: url + '?' + 'maxPoolSize=' + maxPoolSize,
    jwtSecret: "pingpong",
    jwtOptions: { expiresIn: '48h' },
    encryptSecret : "zigzag",
    encryptAlgorithm : "aes-256-ctr"
};