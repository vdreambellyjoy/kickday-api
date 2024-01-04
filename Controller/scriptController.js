const fs = require('fs');
const { ObjectId } = require('mongodb');

const kickDay1 = {

    updateQuantityAsNumber: async (db) => {
        return new Promise(async (resolve, reject) => {
            try {
                console.log('updateQuantityAsNumber execution started');
                let bulkWriteData = [];
                let result = await db.collection('listingOrders').find({}).toArray();
                for (let doc of result) {
                    bulkWriteData.push({
                        updateOne: {
                            filter: { _id: new ObjectId(doc._id) },
                            update: { $set: { quantity: +doc.quantity } },
                        }
                    })
                }
                let updateMany = await db.collection('listingOrders').bulkWrite(bulkWriteData);
                console.log('updateQuantityAsNumber execution finished');
                resolve(true);
            }
            catch (e) {
                console.log(e);
                reject(e)
            }
        })
    },
}

module.exports = {
    kickDay1
};