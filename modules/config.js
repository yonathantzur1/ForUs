var url = 'mongodb://forusdb:Aa123456@ds145329.mlab.com:45329/forus';
var poolSize = 10;

module.exports = {
    connectionString: url + '?' + 'maxPoolSize=' + poolSize
};