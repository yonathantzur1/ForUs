var url = 'mongodb://forusdb:Aa123456@ds021166.mlab.com:21166/forusdb';
var poolSize = 10;

module.exports = {
    connectionString: url + '?' + 'maxPoolSize=' + poolSize
};