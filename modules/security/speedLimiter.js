const config = require('../../config');
const slowDown = require("express-slow-down");

module.exports = slowDown({
    windowMs: config.security.speedLimitter.windowMs,
    delayAfter: config.security.speedLimitter.delayAfter,
    delayMs: config.security.speedLimitter.delayMs
});