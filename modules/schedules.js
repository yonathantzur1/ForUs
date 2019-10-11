const schedule = require('node-schedule');
const config = require('../config');
const logger = require('../logger');
const DAL = require('./DAL');

module.exports = () => {
    // Task for every night at 00:00
    schedule.scheduleJob('0 0 * * *', () => {

    });
};