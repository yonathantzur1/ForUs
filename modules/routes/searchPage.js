const searchPageBL = require('../BL/searchPageBL');

var prefix = "/api/searchPage";

module.exports = function (app) {
    
    app.get(prefix + '/getSearchResults', function (req, res) {
        var input = req.query.input;

        searchPageBL.GetSearchPageResults(input).then(result => {
            res.send(result);
        }).catch(err => {
            res.status(500).end();
        });
    });
}