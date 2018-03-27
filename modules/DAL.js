const config = require('./config');
const MongoClient = require('mongodb').MongoClient, assert = require('assert');
const ObjectId = require('mongodb').ObjectId;

// Connection URL
const connectionString = config.db.connectionString;
const dbName = config.db.name;
const maxConnectionAttemptsNumber = config.db.maxConnectionAttemptsNumber;
const retryCount = 0;

var db;

GetDB = function (callback) {
    // In case there is no connected db.
    if (!db || !db.serverConfig || !db.serverConfig.isConnected()) {
        MongoClient.connect(connectionString, function (err, client) {
            if (err == null) {
                db = client.db(dbName);
                callback(null, db);
            }
            else {
                // In case number of retries is smaller then maximum
                if (retryCount < maxConnectionAttemptsNumber) {
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

                collection.findOne(filter, { fields }, function (err, docs) {
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
    Find: function (collectionName, filter, callback, sortObj) {
        GetDB(function (err, db) {
            if (err == null) {
                var collection = db.collection(collectionName);

                sortObj = sortObj ? sortObj : {};

                collection.find(filter).sort(sortObj).toArray(function (err, docs) {
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
    FindSpecific: function (collectionName, filter, fields, callback, sortObj) {
        GetDB(function (err, db) {
            if (err == null) {
                var collection = db.collection(collectionName);

                sortObj = sortObj ? sortObj : {};

                collection.find(filter, { fields }).sort(sortObj).toArray(function (err, docs) {
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
    UpdateOne: function (collectionName, findObj, updateObj, callback, isInsertIfNotExists) {
        GetDB(function (err, db) {
            if (err == null) {
                var collection = db.collection(collectionName);

                var updateConfig = {
                    returnOriginal: false,
                    upsert: isInsertIfNotExists
                }

                collection.findOneAndUpdate(findObj, updateObj, updateConfig,
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

    // Update documents.
    Update: function (collectionName, findObj, updateObj, callback) {
        GetDB(function (err, db) {
            if (err == null) {
                var collection = db.collection(collectionName);

                var updateConfig = {
                    "multi": true,
                    "upsert": false
                }

                collection.update(findObj, updateObj, updateConfig,
                    function (err, result) {
                        if (err == null) {
                            if (result.result.nModified != 0) {
                                callback(result.result.nModified);
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
                        if (result.deletedCount != 0) {
                            callback(result.deletedCount);
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