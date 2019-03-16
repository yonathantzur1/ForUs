const schedule = require('node-schedule');
const config = require('../config');
const logger = require('../logger');
const chatBL = require('./BL/chatBL');
const DAL = require('./DAL');

const usersCollectionName = config.db.collections.users;

module.exports = () => {
    // Task for every night at 00:00
    schedule.scheduleJob('0 0 * * *', () => {

    });
}