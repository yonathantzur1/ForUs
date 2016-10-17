var config = require('./config.js');

var generator = require('./generator.js');
var codeNumOfDigits = 6;

var MongoClient = require('mongodb').MongoClient,
    assert = require('assert');

// Connection URL
var url = config.connectionString;

module.exports = {
    GetDocsByFilter: function (collectionName, filter, callback) {
        MongoClient.connect(url, function (err, db) {
            if (err == null) {
                var collection = db.collection(collectionName);
                collection.find(filter).toArray(function (err, docs) {
                    if (err == null) {
                        callback(docs);
                    }
                    else {
                        callback(null);
                    }
                });

                db.close();
            }
            else {
                callback(null);
            }
        });
    },

    InsertDocument: function (collectionName, doc, callback) {
        MongoClient.connect(url, function (err, db) {
            if (err == null) {
                var collection = db.collection(collectionName);
                collection.insertOne(doc, function (err, result) {
                    if (err == null) {
                        callback(result);
                    }
                    else {
                        callback(null);
                    }
                });
                db.close();
            }
            else {
                callback(null);
            }
        });
    },

    AddResetCode: function (collectionName, email, callback) {
        var code = generator.GenerateId(codeNumOfDigits);

        MongoClient.connect(url, function (err, db) {
            if (err == null) {
                var collection = db.collection(collectionName);
                collection.findOneAndUpdate(email, {$set: {resetCode: code}}, {
                    returnOriginal: false,
                },
                function(err, result) {
                    if (err == null) {
                        if (result.value != null) {
                            var details = {name: result.value.name, resetCode: code};
                            callback(details);
                        }
                        else {
                            callback(false);
                        }
                    }
                    else {
                        callback(null);
                    }
                });
            }
            else {
                callback(null);
            }
        });
    }

};