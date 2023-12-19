const { ObjectId } = require("mongodb");
const { GridFSBucket } = require('mongodb');



module.exports = async function readFileFromGridfsNew(fileId, db) {
    try {
        const bucket = new GridFSBucket(db);
        const file = await bucket.find({ _id: new ObjectId(fileId) }).toArray();

        if (!file || file.length === 0) {
            return { success: false, error: 'Error occurred while looking for the file!' };
        }

        const buffers = [];
        const downloadStream = bucket.openDownloadStream(new ObjectId(fileId));

        downloadStream.on('data', chunk => {
            buffers.push(chunk);
        });

        const fbuf = await new Promise((resolve, reject) => {
            downloadStream.on('end', () => {
                const fileBuffer = Buffer.concat(buffers);
                resolve(fileBuffer);
            });

            downloadStream.on('error', err => {
                reject(err);
            });
        });

        const base64 = fbuf.toString('base64');
        const finalFileObject = {
            mimetype: file[0].contentType,
            name: file[0].filename,
            size: file[0].chunkSize,
            data: base64,
        };

        return { success: true, data: finalFileObject };
    } catch (err) {
        return { success: false, error: err };
    }
};
