module.exports = function (app, navbarBL) {

    prefix = "/api/navbar";

    // Getting search result for the main search.
    app.post(prefix + '/getMainSearchResults', function (req, res) {
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

    // Getting search result profiles for the main search.
    app.post(prefix + '/getMainSearchResultsWithImages', function (req, res) {
        navbarBL.GetMainSearchResultsWithImages(req.body.ids, function (profiles) {
            // In case the result is not null.
            if (profiles) {
                res.send(profiles);
            }
            else {
                res.send(null);
            }
        });
    });

};