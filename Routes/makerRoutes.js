const makerRoutes = require('express').Router()
const { makerController } = require('../Controller/makerController');
const saveImagesToGridFS = require('../middlewares/uploadBase64Image')


makerRoutes.post('/deleteListing', makerController.deleteListing);
makerRoutes.post('/addListing',saveImagesToGridFS, makerController.addListing);
makerRoutes.post('/getMakerDashboardData', makerController.getMakerDashboardData);

module.exports = { makerRoutes };