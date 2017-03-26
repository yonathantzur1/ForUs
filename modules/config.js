var url = 'mongodb://forusdb:Aa123456@ds143030.mlab.com:43030/forus';
var poolSize = 10;

module.exports = {
    connectionString: url + '?' + 'maxPoolSize=' + poolSize
};