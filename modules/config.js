var url = 'mongodb://forusdb:Aa123456@ds157320.mlab.com:57320/forus';
var maxPoolSize = 10;

module.exports = {
    connectionString: url + '?' + 'maxPoolSize=' + maxPoolSize
};