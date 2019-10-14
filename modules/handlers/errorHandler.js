const logger = require('../../logger');

module.exports = {
    promiseError(err) {
        return Promise.reject(err);
    },

    routeError(err, res) {
        logger.error(err);
        res.sendStatus(500);
    }
}