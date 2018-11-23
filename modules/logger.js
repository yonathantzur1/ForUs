const { createLogger, format, transports } = require('winston');
const { combine, timestamp, json } = format;
const path = require('path');
const config = require('../config');

module.exports = (rootDir) => {
    var logsDir = path.join(rootDir + "\\" + config.logs.directoryName);

    const logger = createLogger({
        format: combine(
            timestamp(),
            json()
        ),
        transports: [
            new transports.File({ filename: logsDir + "\\" + config.logs.fileName })
        ]
    });

    // Print log to console in case the env is not prod.
    if (!config.server.isProd) {
        logger.add(new transports.Console({
            format: json()
        }));
    }

    return logger;
};