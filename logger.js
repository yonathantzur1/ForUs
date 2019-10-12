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
        new transports.File({ filename: path.join(logsDir, config.logs.mainLogName) })
    ]
});

const secure = createLogger({
    level: 'info',
    format: combine(
        timestamp(),
        json()
    ),
    transports: [
        new transports.File({ filename: path.join(logsDir, config.logs.secureLogName) })
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
    info: (data) => {
        logData(logger.info, data);
    },

    error: (data) => {
        logData(logger.error, data);
    },

    warn: (data) => {
        logData(logger.warn, data);
    },

    danger: (data) => {
        logData(logger.danger, data);
    },

    secure: (data) => {
        logData(secure.warn, data);
    }
};

function logData(logger, data) {
    data && logger(createLogStr(data));
}

function createLogStr(data) {
    let msg;

    if (typeof data == "object") {
        msg = data.message || JSON.stringify(data);
    } else {
        msg = data.toString();
    }

    return msg;
}