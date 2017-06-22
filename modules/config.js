var url = 'mongodb://forusdb:Aa123456@ds117109.mlab.com:17109/forus';
var maxPoolSize = 10;

module.exports = {
    connectionString: url + '?' + 'maxPoolSize=' + maxPoolSize
};