const makerRoutes = require('express').Router()
const { makerController } = require('../Controller/makerController');
const saveImagesToGridFS = require('../middlewares/uploadBase64Image')


makerRoutes.post('/deleteListing', makerController.deleteListing);
makerRoutes.post('/addEditListing', saveImagesToGridFS, makerController.addEditListing);
makerRoutes.post('/getMakerDashboardData', makerController.getMakerDashboardData);
makerRoutes.post('/changeOrderStatus', makerController.changeOrderStatus);
makerRoutes.post('/toggleMakerStatus', makerController.toggleMakerStatus);

module.exports = { makerRoutes };