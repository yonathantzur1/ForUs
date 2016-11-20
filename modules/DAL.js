var config = require('./config.js');
var MongoClient = require('mongodb').MongoClient,
    assert = require('assert');

// Connection URL
var url = config.connectionString;
var db;
var poolSize = 10;
var maxConnectRetry = 5;
var retryCount = 0;

GetDB = function (callback) {
    if (!db || !db.serverConfig || !db.serverConfig.isConnected()) {
        MongoClient.connect(url, { server: { maxPoolSize: poolSize } }, function (err, database) {
            if (err == null) {
                db = database;
                callback(null, db);
            }
            else {
                if (retryCount < maxConnectRetry) {
                    retryCount++;
                    getDB(callback);
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

module.exports = {
    GetDocsByFilter: function (collectionName, filter, callback) {
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

    InsertDocument: function (collectionName, doc, callback) {
        GetDB(function (err, db) {
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
            }
            else {
                callback(null);
            }
        });
    },

    UpdateDocument: function (collectionName, idObj, fieldToUpdateObj, callback) {
        GetDB(function (err, db) {
            if (err == null) {
                var collection = db.collection(collectionName);
                collection.findOneAndUpdate(idObj, { $set: fieldToUpdateObj }, {
                    returnOriginal: false,
                },
                    function (err, result) {
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