const { ObjectId } = require("mongodb");
const { GridFSBucket } = require('mongodb');

module.exports = async function removeFileFromGridfs(fileId, db) {
    return new Promise(async (resolve, reject) => {
        try {
            const bucket = new GridFSBucket(db);
            const file = await bucket.find({ _id: new ObjectId(fileId) }).toArray();
            if (fileId && ObjectId.isValid(fileId)) {
                let deleteFile = await bucket.delete(new ObjectId(fileId));
            }
            resolve(true);
        } catch (err) {
            resolve(false);
        }
    });
}


