var url = 'mongodb://forusdb:Aa123456@ds123182.mlab.com:23182/forus';
var maxPoolSize = 10;

module.exports = {
    connectionString: url + '?' + 'maxPoolSize=' + maxPoolSize
};