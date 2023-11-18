module.exports = {
    insertOne: async (db, collectionName, insertObjectdata) => {
        return new Promise(async (resolve, reject) => {
            try {
                let result = await db.collection(collectionName).insertOne(insertObjectdata);
                resolve(result);
            } catch (error) {
                reject(error);
            };
        });
    },

    insertMany: async (db, collectionName, insertData) => {
        return new Promise(async (resolve, reject) => {
            try {
                let result = await db.collection(collectionName).insertMany(insertData);
                resolve(result);
            } catch (error) {
                reject(error);
            };
        });
    },

    findAll: async (db, collectionName, findObject, sortValue = -1, sortKey = '_id') => {
        return new Promise(async (resolve, reject) => {
            try {
                let sortObj = { [sortKey]: sortValue }
                let result = await db.collection(collectionName).find(findObject).sort(sortObj).toArray();
                resolve(result);
            } catch (error) {
                reject(error);
            };
        });
    },

    findOne: async (db, collectionName, findObject) => {
        return new Promise(async (resolve, reject) => {
            try {
                let result = await db.collection(collectionName).findOne(findObject);
                resolve(result);
            } catch (error) {
                reject(error);
            };
        });
    },

    updateOne: (conn, params, collection, upsert) => {
        return new Promise(async (resolve, reject) => {
            try {
                let result = await conn.collection(collection).updateOne(
                    params['where'], { $set: params['set'] }, { upsert: upsert }
                );
                resolve(result);
            } catch (error) {
                reject(error);
            };
        });
    },

    updateMany: async (db, collectionName, findObject, updateObject, upsert) => {
        return new Promise(async (resolve, reject) => {
            try {
                let result = await db.collection(collectionName).updateMany(
                    findObject,
                    { $set: updateObject },
                    { upsert: upsert }
                );
                resolve(result);
            } catch (error) {
                reject(error);
            };
        });
    },

    removeRecord: async (db, collectionName, findObject) => {
        return new Promise(async (resolve, reject) => {
            try {
                let data = await db.collection(collectionName).deleteMany(findObject);
                resolve(data);
            } catch (error) {
                reject(error)
            };
        });
    },

    deleteOne: async (db, collectionName, findObject) => {
        return new Promise(async (resolve, reject) => {
            try {
                let data = await db.collection(collectionName).deleteOne(findObject);
                resolve(data);
            } catch (error) {
                reject(error)
            };
        });
    },

    countModel(conn, collection, match) {
        return new Promise(async (resolve, reject) => {
            try {
                let result = await conn.collection(collection).count(match);
                resolve(result);
            } catch (err) {
                reject(err)
            };
        });
    },
}