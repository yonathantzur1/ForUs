const { createLogger, format, transports } = require('winston');
const { combine, timestamp, json } = format;
const path = require('path');
const config = require('./config');

const logsDir = path.join(__dirname, config.logs.directoryName);

const logger = createLogger({
    level: 'info',
    format: combine(
        timestamp(),
        json()
    ),
    transports: [
        new transports.File({ filename: path.join(logsDir, 'forus.log') })
    ]
});

const secure = createLogger({
    level: 'info',
    format: combine(
        timestamp(),
        json()
    ),
    transports: [
        new transports.File({ filename: path.join(logsDir, 'secure.log') })
    ]
});

// Print log to console in case the environment is not prod.
if (!config.server.isProd) {
    logger.add(new transports.Console({
        format: json()
    }));

    secure.add(new transports.Console({
        format: json()
    }));
}

module.exports = {
    info: (err) => {
        logError(logger.info, err);
    },

    error: (err) => {
        logError(logger.error, err);
    },

    warn: (err) => {
        logError(logger.warn, err);
    },

    danger: (err) => {
        logError(logger.danger, err);
    },

    secure: (msg) => {
        logError(secure.warn, msg);
    }
}

function logError(logFunction, err) {
    err && logFunction(createErrorMsg(err));
}

function createErrorMsg(err) {
    let msg;

    if (typeof err == "object") {
        msg = err.message || JSON.stringify(err);
    }
    else {
        msg = err.toString();
    }

    return msg;
}