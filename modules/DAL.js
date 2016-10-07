var config = require('./config.js');

var MongoClient = require('mongodb').MongoClient,
                  assert = require('assert');

// Connection URL
var url = config.connectionString;

module.exports = {
    GetDocsByFilter : function(collectionName, filter, callback) {
        MongoClient.connect(url, function(err, db) {
            if (err == null) {
                var collection = db.collection(collectionName);
                collection.find(filter).toArray(function(err, docs) {
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

    InsertDocument : function(collectionName, doc, callback) {
        MongoClient.connect(url, function(err, db) {
            if (err == null) {
                var collection = db.collection(collectionName);
                collection.insertOne(doc, function(err, result) {
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
    }
};