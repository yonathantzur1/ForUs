const config = require('../../config');
const Ddos = require('ddos');

const ddos = new Ddos({
    burst: config.security.ddos.burst,
    limit: config.security.ddos.limit
});

module.exports = ddos.express;