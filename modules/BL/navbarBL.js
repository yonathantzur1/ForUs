var DAL = require('../DAL.js');

var usersCollectionName = "Users";
var profileCollectionName = "Profiles";

module.exports = {

    GetMainSearchResults: function (searchInput, callback) {
        var usersFilter = {"firstName": new RegExp("^" + searchInput, 'g')};

        DAL.FindSpecific(usersCollectionName, usersFilter, {"firstName": true}, function(result) {
            callback(result);
        });
    }

};