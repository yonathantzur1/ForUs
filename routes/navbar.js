module.exports = function (app, navbarBL) {

    // Getting search result for the main search.
    app.post('/getMainSearchResults', function (req, res) {
        navbarBL.GetMainSearchResults(req.body.searchInput, req.body.searchLimit, function (results) {
            // In case the result is not null.
            if (results) {
                res.send(results);
            }
            else {
                res.send(null);
            }
        });
    });

    // Getting search result for the main search.
    app.post('/getMainSearchResultsWithImages', function (req, res) {
        navbarBL.GetMainSearchResultsWithImages(req.body.searchInput, req.body.searchLimit, function (results) {
            // In case the result is not null.
            if (results) {
                res.send(results);
            }
            else {
                res.send(null);
            }
        });
    });

};