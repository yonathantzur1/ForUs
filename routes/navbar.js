module.exports = function (app, navbarBL) {

    prefix = "/api/navbar";

    app.post(prefix + '/getFriends', function (req, res) {
        navbarBL.GetFriends(req.body, function (friends) {
            res.send(friends);
        });
    });

    // Getting search result for the main search.
    app.post(prefix + '/getMainSearchResults', function (req, res) {
        navbarBL.GetMainSearchResults(req.body.searchInput, req.body.searchLimit, function (results) {
            res.send(results);
        });
    });

    // Getting search result profiles for the main search.
    app.post(prefix + '/getMainSearchResultsWithImages', function (req, res) {
        navbarBL.GetMainSearchResultsWithImages(req.body.ids, function (profiles) {
            res.send(profiles);
        });
    });

};