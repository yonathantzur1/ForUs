const { createLogger, format, transports } = require('winston');
const { combine, timestamp, json } = format;
var fs = require('fs');
const config = require('../config');

(!fs.existsSync(config.logs.directoryName)) && (fs.mkdirSync(config.logs.directoryName));


const logger = createLogger({
    format: combine(
        timestamp(),
        json()
    ),
    transports: [
        new transports.File({ filename: config.logs.directoryName + '/logs.log' })
    ]
});

if (!config.server.isProd) {
    logger.add(new transports.Console({
        format: json()
    }));
}

module.exports = logger;