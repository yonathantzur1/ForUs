var config = require('./config.js');
var MongoClient = require('mongodb').MongoClient, assert = require('assert');
var ObjectId = require('mongodb').ObjectId;

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
    // Convert string id to mongo object id.
    GetObjectId: function (id) {
        return new ObjectId(id);
    },

    // Getting documents from collection by filter.
    FindOne: function (collectionName, filter, callback) {
        GetDB(function (err, db) {
            if (err == null) {
                var collection = db.collection(collectionName);

                collection.findOne(filter, function (err, docs) {
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

    // Getting documents from collection by filter.
    FindOneSpecific: function (collectionName, filter, fields, callback) {
        GetDB(function (err, db) {
            if (err == null) {
                var collection = db.collection(collectionName);

                collection.findOne(filter, fields, function (err, docs) {
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

    // Getting documents from collection by filter.
    FindSpecific: function (collectionName, filter, fields, callback) {
        GetDB(function (err, db) {
            if (err == null) {
                var collection = db.collection(collectionName);

                collection.find(filter, fields).toArray(function (err, docs) {
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

    // Getting documents from collection by filter.
    Aggregate: function (collectionName, aggregateArray, callback) {
        GetDB(function (err, db) {
            if (err == null) {
                var collection = db.collection(collectionName);

                collection.aggregate(aggregateArray).toArray(function (err, docs) {
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
    UpdateOne: function (collectionName, idObj, fieldToUpdateObj, callback, isInsertIfNotExists) {
        GetDB(function (err, db) {
            if (err == null) {
                var collection = db.collection(collectionName);

                var updateConfig = {
                    returnOriginal: false,
                    upsert: isInsertIfNotExists
                }

                collection.findOneAndUpdate(idObj, fieldToUpdateObj, updateConfig,
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
    },

    // Delete documents by filter.
    Delete: function (collectionName, filter, callback) {
        GetDB(function (err, db) {
            if (err == null) {
                var collection = db.collection(collectionName);

                collection.deleteMany(filter, function (err, result) {
                    if (err == null) {
                        callback(result.deletedCount);
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

    // Save or update document.
    Save: function (collectionName, object, callback) {
        GetDB(function (err, db) {
            if (err == null) {
                var collection = db.collection(collectionName);

                collection.save(object, function (err, result) {
                    if (err == null) {
                        callback(result.n);
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