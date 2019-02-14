const { createLogger, format, transports } = require('winston');
const { combine, timestamp, json } = format;
const path = require('path');
const config = require('./config');

let logsDir = path.join(__dirname, "\\", config.logs.directoryName);

const logger = createLogger({
    level: 'info',
    format: combine(
        timestamp(),
        json()
    ),
    transports: [
        new transports.File({ filename: path.join(logsDir, "\\", 'error.log'), level: 'error' }),
        new transports.File({ filename: 'combined.log' })
    ]
});

// Print log to console in case the environment is not prod.
if (!config.server.isProd) {
    logger.add(new transports.Console({
        format: json()
    }));
}

module.exports = {
    error: (err) => {
        let errMsg;

        if (typeof err == "object" && err.message) {
            errMsg = err.message;
        }
        else if (typeof err == "string") {
            errMsg = err;
        }
        else {
            errMsg = JSON.stringify(err);
        }

        logger.error(errMsg);
    }
}