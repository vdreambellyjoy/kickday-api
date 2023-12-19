const { GridFSBucket } = require('mongodb');
const removeFileFromGridfs = require('./gridFsRemoveFile');

const saveImagesToGridFS = async (req, res, next) => {
  const isImageArray = Array.isArray(req.body.image);
  const images = Array.isArray(req.body.image) ? req.body.image : [{ image: req.body.image, imageName: req.body.imageName, imageId: req.body.imageId }];
  let imageIdArray = [];
  let errorOccurred = false;
  try {

    if (images.length) {
      for (const [i, imageData] of images.entries()) {
        if (errorOccurred) return;

        const image = imageData.image;
        const imageType = getImageTypeFromBase64(image);

        if (!image || !imageType) {
          errorOccurred = true;
          return res.status(400).json({ success: false, code: 500, error: 'Base64 image data or image type is missing', message: 'something went wrong' });
        }

        const db = req.db;
        const gridFSBucket = new GridFSBucket(db);
        let base64Image = image.replace(/^data:image\/[a-zA-Z0-9+\/]+;base64,/, '');
        if (imageType === 'svg+xml' || imageType === 'svg') {
          base64Image = image.replace(/^data:image\/svg\+xml;base64,/, '');
        }
        const binaryData = Buffer.from(base64Image, 'base64');

        const uploadImage = () => {
          return new Promise((resolve, reject) => {
            const stream = gridFSBucket.openUploadStream(imageData.imageName, {
              contentType: imageType,
              metadata: { filename: imageData.imageName, mode: 'w', content_type: imageType }
            });

            stream.write(binaryData);
            stream.end();

            stream.on('close', () => {
              if (imageData.imageId) removeFileFromGridfs(imageData.imageId, db).catch(err => { });
              resolve(stream.id);
            });

            stream.on('error', error => {
              errorOccurred = true;
              reject(error);
            });
          });
        };

        try {
          const imageId = await uploadImage();
          imageIdArray.push(imageId);
          if (i === images.length - 1) {
            delete req.body.image;
            if (isImageArray) {
              req.body.imageArray = imageIdArray;
            } else {
              req.body.imageId = imageId;
            }
            next();
          }
        } catch (error) {
          errorOccurred = true;
          return res.status(500).json({ success: false, code: 500, error: error.message, message: 'something went wrong' });
        }
      }
    } else {
      next();
    }
  } catch (err) {
    return res.status(500).json({ success: false, code: 500, error: err.message, message: 'something went wrong' });
  }
};

function getImageTypeFromBase64(base64String) {
  const matches = base64String.match(/^data:image\/(svg\+xml|svg|([a-zA-Z0-9]+));base64,/);
  if (matches && matches.length > 1) return matches[1];
  else return null;
}

module.exports = saveImagesToGridFS;
