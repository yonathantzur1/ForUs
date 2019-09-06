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
    if (db && db.serverConfig.isConnected()) {
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
})().catch((err) => { logger.error(err) });

async function GetCollection(collectionName) {
    return (await GetDB()).collection(collectionName);
};

module.exports = {
    // Convert string id to mongoDB object id.
    GetObjectId(id) {
        return new ObjectId(id);
    },

    // Get one document from collection by filter.
    async FindOne(collectionName, filter) {
        let collection = await GetCollection(collectionName);

        return collection.findOne(filter);
    },

    // Get document specific fields from collection by filter.
    async FindOneSpecific(collectionName, filter, projection) {
        let collection = await GetCollection(collectionName);

        return collection.findOne(filter, { projection });
    },

    // Get documents from collection by filter.
    async Find(collectionName, filter, sortObj) {
        let collection = await GetCollection(collectionName);

        return collection.find(filter).sort(sortObj || {}).toArray();
    },

    // Get documents specific fields from collection by filter.
    async FindSpecific(collectionName, filter, projection, sortObj) {
        let collection = await GetCollection(collectionName);

        return collection.find(filter, { projection }).sort(sortObj || {}).toArray();
    },

    // Aggregate documents.
    async Aggregate(collectionName, aggregateArray) {
        let collection = await GetCollection(collectionName);

        return collection.aggregate(aggregateArray).toArray();
    },

    // Insert new document.
    async Insert(collectionName, doc) {
        let collection = await GetCollection(collectionName);
        let result = await collection.insertOne(doc);

        return result.insertedId;
    },

    // Update one document.
    async UpdateOne(collectionName, findObj, updateObj, isInsertIfNotExists) {
        let collection = await GetCollection(collectionName);
        let updateResult = await collection.findOneAndUpdate(findObj, updateObj, {
            returnOriginal: false,
            upsert: isInsertIfNotExists
        });

        return updateResult.value || false;
    },

    // Update documents.
    async Update(collectionName, findObj, updateObj, isInsertIfNotExists) {
        let collection = await GetCollection(collectionName);
        let updateResult = await collection.updateMany(findObj, updateObj, {
            upsert: isInsertIfNotExists
        });
        let modifiedAmount = updateResult.result.nModified;

        return (modifiedAmount > 0 ? modifiedAmount : false);
    },

    // Delete documents by filter.
    async Delete(collectionName, filter) {
        let collection = await GetCollection(collectionName);
        let deleteResult = await collection.deleteMany(filter);
        let deletedAmount = deleteResult.deletedCount;

        return (deletedAmount > 0 ? deletedAmount : false);
    },

    // Delete one document by filter.
    async DeleteOne(collectionName, filter) {
        let collection = await GetCollection(collectionName);
        let deleteResult = await collection.deleteOne(filter);

        return (deleteResult.result.n != 0);
    },

    // Getting documents amount by filter.
    async Count(collectionName, filter) {
        let collection = await GetCollection(collectionName);

        return collection.find(filter).count();
    }
};