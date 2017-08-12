var url = 'mongodb://forusdb:Aa123456@ds117189.mlab.com:17189/forus';
var maxPoolSize = 10;

module.exports = {
    connectionString: url + '?' + 'maxPoolSize=' + maxPoolSize,
    jwtSecret: "pingpong",
    jwtOptions: { expiresIn: '48h' }
};