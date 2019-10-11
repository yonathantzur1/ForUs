const config = require('../config');
const mongodb = require('mongodb');
const logger = require('../logger');
const MongoClient = mongodb.MongoClient;
const ObjectId = mongodb.ObjectId;

// Connection parameters
const connectionString = config.db.connectionString;
const dbName = config.db.name;
let db;

(getDB = async () => {
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

async function getCollection(collectionName) {
    return (await getDB()).collection(collectionName);
};

function handleError(err) {
    logger.error(err);
    return null;
}

module.exports = {
    // Convert string id to mongoDB object id.
    getObjectId(id) {
        return new ObjectId(id);
    },

    // Get one document from collection by filter.
    async findOne(collectionName, filter) {
        try {
            let collection = await getCollection(collectionName);

            return collection.findOne(filter);
        }
        catch (err) {
            return handleError(err);
        }
    },

    // Get document specific fields from collection by filter.
    async findOneSpecific(collectionName, filter, projection) {
        try {
            let collection = await getCollection(collectionName);

            return collection.findOne(filter, { projection });
        }
        catch (err) {
            return handleError(err);
        }
    },

    // Get documents from collection by filter.
    async find(collectionName, filter, sortObj) {
        try {
            let collection = await getCollection(collectionName);

            return collection.find(filter).sort(sortObj || {}).toArray();
        }
        catch (err) {
            return handleError(err);
        }
    },

    // Get documents specific fields from collection by filter.
    async findSpecific(collectionName, filter, projection, sortObj) {
        try {
            let collection = await getCollection(collectionName);

            return collection.find(filter, { projection }).sort(sortObj || {}).toArray();
        }
        catch (err) {
            return handleError(err);
        }
    },

    // Aggregate documents.
    async aggregate(collectionName, aggregateArray) {
        try {
            let collection = await getCollection(collectionName);

            return collection.aggregate(aggregateArray).toArray();
        }
        catch (err) {
            return handleError(err);
        }
    },

    // Insert new document.
    async insert(collectionName, doc) {
        try {
            let collection = await getCollection(collectionName);
            let result = await collection.insertOne(doc);

            return result.insertedId;
        }
        catch (err) {
            return handleError(err);
        }
    },

    // Update one document.
    async updateOne(collectionName, findObj, updateObj, isInsertIfNotExists) {
        try {
            let collection = await getCollection(collectionName);
            let updateResult = await collection.findOneAndUpdate(findObj, updateObj, {
                returnOriginal: false,
                upsert: isInsertIfNotExists
            });

            return updateResult.value || false;
        }
        catch (err) {
            return handleError(err);
        }
    },

    // Update documents.
    async update(collectionName, findObj, updateObj, isInsertIfNotExists) {
        try {
            let collection = await getCollection(collectionName);
            let updateResult = await collection.updateMany(findObj, updateObj, {
                upsert: isInsertIfNotExists
            });
            let modifiedAmount = updateResult.result.nModified;

            return (modifiedAmount > 0 ? modifiedAmount : false);
        }
        catch (err) {
            return handleError(err);
        }
    },

    // Delete documents by filter.
    async delete(collectionName, filter) {
        try {
            let collection = await getCollection(collectionName);
            let deleteResult = await collection.deleteMany(filter);
            let deletedAmount = deleteResult.deletedCount;

            return (deletedAmount > 0 ? deletedAmount : false);
        }
        catch (err) {
            return handleError(err);
        }
    },

    // Delete one document by filter.
    async deleteOne(collectionName, filter) {
        try {
            let collection = await getCollection(collectionName);
            let deleteResult = await collection.deleteOne(filter);

            return (deleteResult.result.n != 0);
        }
        catch (err) {
            return handleError(err);
        }
    },

    // Getting documents amount by filter.
    async count(collectionName, filter) {
        try {
            let collection = await getCollection(collectionName);

            return collection.find(filter).count();
        }
        catch (err) {
            return handleError(err);
        }
    }
};