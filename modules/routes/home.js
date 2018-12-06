const searchPageBL = require('../BL/homeBL');

var prefix = "/api/home";

module.exports = function (app) {

    app.put(prefix + '/saveUserLocation', function (req, res) {
        res.end();
    });

}