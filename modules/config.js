var url = 'mongodb://forusdb:Aa123456@ds147052.mlab.com:47052/forus';
var maxPoolSize = 10;

module.exports = {
    connectionString: url + '?' + 'maxPoolSize=' + maxPoolSize,
    jwtSecret: "pingpong",
    jwtTimeoutHours: 24,
    jwtOptions: { expiresIn: '24h' }
};