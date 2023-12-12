// middleware/saveImageToGridFS.js
const { GridFSBucket } = require('mongodb');

const saveImageToGridFS = (req, res, next) => {
  const base64Image = req.body.image;

  if (!base64Image) {
    return res.status(400).json({ error: 'Base64 image data is missing' });
  }

  const db = req.db; // Assuming the database connection is available in req.db

  const bucket = new GridFSBucket(db);

  const buffer = Buffer.from(base64Image, 'base64');
  const readableStream = require('stream').Readable.from(buffer);

  const filename = req.body.imageName || `${req.body.userName}_customer.jpg`;

  const uploadStream = bucket.openUploadStream(filename);

  readableStream.pipe(uploadStream)
    .on('error', (uploadErr) => {
      console.error('Error occurred while uploading image:', uploadErr);
      return res.status(500).json({ error: 'Error uploading image' });
    })
    .on('finish', () => {
      console.log('Image uploaded successfully');
      req.body.imageId = uploadStream.id;
      next();
    });
};

module.exports = saveImageToGridFS;
