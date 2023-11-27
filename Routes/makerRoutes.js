const makerRoutes = require('express').Router()
const { makerController } = require('../Controller/makerController');


makerRoutes.post('/addListing', makerController.addListing);
makerRoutes.post('/getMakerListings', makerController.getMakerListings);
makerRoutes.post('/getListingBasedOnId', makerController.getListingBasedOnId);
makerRoutes.post('/deleteListing', makerController.deleteListing);
makerRoutes.post('/getMakerDashboardData', makerController.getMakerDashboardData);

module.exports = { makerRoutes };