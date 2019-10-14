const { createLogger, format, transports } = require('winston');
const { combine, timestamp, json, printf } = format;
const path = require('path');
const config = require('./config');

const logsDir = path.join(__dirname, config.logs.directoryName);

const logFormat = printf(info => {
    const data = info.message || "";
    const level = info.level;
    const timestamp = info.timestamp;

    let message;

    if (typeof data == "object") {
        message = JSON.stringify(data);
    } else {
        message = data.toString();
    }

    let log = {
        message,
        level,
        timestamp
    }

    info.stack && (log.stack = info.stack);

    return JSON.stringify(log);
});

const formatBuild = combine(
    timestamp(),
    logFormat
);

function createTransportsFile(fileName) {
    return new transports.File({
        filename: path.join(logsDir, fileName),
        maxsize: config.logs.maxLogSize,
        maxFiles: config.logs.maxLogFiles
    });
}

const logger = createLogger({
    format: formatBuild,
    transports: [
        createTransportsFile(config.logs.mainLogName)
    ]
});

const secure = createLogger({
    format: formatBuild,
    transports: [
        createTransportsFile(config.logs.secureLogName)
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
    data && logger(data);
}