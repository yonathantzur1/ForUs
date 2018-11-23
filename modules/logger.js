const { createLogger, format, transports } = require('winston');
const { combine, timestamp, json } = format;
var fs = require('fs');
const path = require('path');
const config = require('../config');

module.exports = (rootDir) => {
    var logsDir = path.join(rootDir + "\\" + config.logs.directoryName);

    (!fs.existsSync(logsDir)) && (fs.mkdirSync(logsDir));


    const logger = createLogger({
        format: combine(
            timestamp(),
            json()
        ),
        transports: [
            new transports.File({ filename: logsDir + "\\" + config.logs.fileName })
        ]
    });

    if (!config.server.isProd) {
        logger.add(new transports.Console({
            format: json()
        }));
    }

    return logger;
};