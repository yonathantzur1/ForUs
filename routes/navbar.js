module.exports = function (app, navbarBL) {

    // Getting search result for the main search.
    app.post('/getMainSearchResults', function (req, res) {
        navbarBL.GetMainSearchResults(req.body.searchInput, function (results) {
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