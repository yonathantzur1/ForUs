var config = require('./config.js');
var MongoClient = require('mongodb').MongoClient,
    assert = require('assert');

// Connection URL
var url = config.connectionString;
var db;
var maxConnectRetry = 5;
var retryCount = 0;

GetDB = function (callback) {
    // In case there is no connected db.
    if (!db || !db.serverConfig || !db.serverConfig.isConnected()) {
        MongoClient.connect(url, function (err, database) {
            if (err == null) {
                db = database;
                callback(null, db);
            }
            else {
                // In case number of retries is smaller then maximum
                if (retryCount < maxConnectRetry) {
                    retryCount++;
                    GetDB(callback);
                }
                else {
                    callback(err, db);
                }
            }
        });
    }
    else {
        callback(null, db);
    }
}

// Initialize DB connection.
GetDB(function (err, db) { });

module.exports = {
    // Getting documents from collection by filter.
    Find: function (collectionName, filter, callback) {
        GetDB(function (err, db) {
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
            }
            else {
                callback(null);
            }
        });
    },

    // Insert new document.
    Insert: function (collectionName, doc, callback) {
        GetDB(function (err, db) {
            if (err == null) {
                var collection = db.collection(collectionName);
                collection.insertOne(doc, function (err, result) {
                    if (err == null) {
                        callback(result.insertedId);
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
    },

    // Update one document.
    Update: function (collectionName, idObj, fieldToUpdateObj, callback) {
        GetDB(function (err, db) {
            if (err == null) {
                var collection = db.collection(collectionName);
                collection.findOneAndUpdate(idObj, { $set: fieldToUpdateObj }, {
                    returnOriginal: false,
                }, function (err, result) {
                    if (err == null) {
                        if (result.value != null) {
                            callback(result.value);
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