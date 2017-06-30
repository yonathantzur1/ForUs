var url = 'mongodb://forusdb:Aa123456@ds143532.mlab.com:43532/forus';
var maxPoolSize = 10;

module.exports = {
    connectionString: url + '?' + 'maxPoolSize=' + maxPoolSize
};