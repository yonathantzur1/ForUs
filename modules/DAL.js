const config = require('../config');
const mongodb = require('mongodb');
const logger = require('../logger');
const MongoClient = mongodb.MongoClient;
const ObjectId = mongodb.ObjectId;

// Connection parameters
const connectionString = config.db.connectionString;
const dbName = config.db.name;
let db;

(GetDB = async () => {
    // In case db connection exists and open.
    if (db && db.serverConfig && db.serverConfig.isConnected()) {
        return db;
    }
    else {
        let client = await MongoClient.connect(connectionString,
            { useNewUrlParser: true, useUnifiedTopology: true }).catch(err => {
                logger.error(err);
                return Promise.reject(err);
            });

        return (db = client.db(dbName));
    }
})().catch(() => { logger.error("Error initialize first DB connection") });

module.exports = {
    // Convert string id to mongoDB object id.
    GetObjectId(id) {
        return new ObjectId(id);
    },

    // Get one document from collection by filter.
    async FindOne(collectionName, filter) {
        let collection = (await GetDB()).collection(collectionName);
        return collection.findOne(filter);
    },

    // Get document specific fields from collection by filter.
    async FindOneSpecific(collectionName, filter, projection) {
        let collection = (await GetDB()).collection(collectionName);
        return collection.findOne(filter, { projection });
    },

    // Get documents from collection by filter.
    async Find(collectionName, filter, sortObj) {
        let collection = (await GetDB()).collection(collectionName);
        return collection.find(filter).sort(sortObj || {}).toArray();
    },

    // Get documents specific fields from collection by filter.
    FindSpecific(collectionName, filter, projection, sortObj) {
        return new Promise((resolve, reject) => {
            GetDB().then(db => {
                let collection = db.collection(collectionName);
                sortObj = sortObj ? sortObj : {};
                collection.find(filter, { projection }).sort(sortObj).toArray().then(resolve);
            }).catch(reject);
        });
    },

    // Aggregate documents.
    Aggregate(collectionName, aggregateArray) {
        return new Promise((resolve, reject) => {
            GetDB().then(db => {
                let collection = db.collection(collectionName);
                collection.aggregate(aggregateArray).toArray().then(resolve);
            }).catch(reject);
        });
    },

    // Insert new document.
    Insert(collectionName, doc) {
        return new Promise((resolve, reject) => {
            GetDB().then(db => {
                let collection = db.collection(collectionName);
                collection.insertOne(doc).then(result => {
                    resolve(result.insertedId);
                });
            }).catch(reject);
        });
    },

    // Update one document.
    UpdateOne(collectionName, findObj, updateObj, isInsertIfNotExists) {
        return new Promise((resolve, reject) => {
            GetDB().then(db => {
                let collection = db.collection(collectionName);
                let updateConfig = {
                    returnOriginal: false,
                    upsert: isInsertIfNotExists
                }

                collection.findOneAndUpdate(findObj, updateObj, updateConfig).then(updateResult => {
                    resolve(updateResult.value || false);
                });
            }).catch(reject);
        });
    },

    // Update documents.
    Update(collectionName, findObj, updateObj) {
        return new Promise((resolve, reject) => {
            GetDB().then(db => {
                let collection = db.collection(collectionName);
                let updateConfig = {
                    upsert: false
                }

                collection.updateMany(findObj, updateObj, updateConfig).then(updateResult => {
                    let modifiedAmount = updateResult.result.nModified;
                    resolve(modifiedAmount > 0 ? modifiedAmount : false);
                });
            }).catch(reject);
        });
    },

    // Delete documents by filter.
    Delete(collectionName, filter) {
        return new Promise((resolve, reject) => {
            GetDB().then(db => {
                let collection = db.collection(collectionName);
                collection.deleteMany(filter).then(deleteResult => {
                    let deletedAmount = deleteResult.deletedCount;
                    resolve(deletedAmount > 0 ? deletedAmount : false);
                });
            }).catch(reject);
        });
    },

    // Delete one document by filter.
    DeleteOne(collectionName, filter) {
        return new Promise((resolve, reject) => {
            GetDB().then(db => {
                let collection = db.collection(collectionName);
                collection.deleteOne(filter).then(deleteResult => {
                    resolve(deleteResult.result.n != 0);
                });
            }).catch(reject);
        });
    },

    // Getting documents amount by filter.
    Count(collectionName, filter) {
        return new Promise((resolve, reject) => {
            GetDB().then(db => {
                let collection = db.collection(collectionName);
                collection.find(filter).count().then(resolve);
            }).catch(reject);
        });
    }

};