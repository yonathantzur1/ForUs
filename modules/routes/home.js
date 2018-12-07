const homeBL = require('../BL/homeBL');

var prefix = "/api/home";

module.exports = function (app) {

    app.put(prefix + '/saveUserLocation', function (req, res) {
        homeBL.SaveUserLocation(req.user._id, req.body.xCord, req.body.yCord).then(result => {
            res.send(result);
        }).catch((err) => {
            res.status(500).end();
        });
    });

    app.put(prefix + '/saveUserLocationError', function (req, res) {
        homeBL.SaveUserLocationError(req.user._id, req.body.error).then(result => {
            res.send(result);
        }).catch((err) => {
            res.status(500).end();
        });
    });

}