const logger = require('../../logger');

module.exports = {
    routeError(err, res) {
        logger.error(err);
        res.sendStatus(500);
    }
}