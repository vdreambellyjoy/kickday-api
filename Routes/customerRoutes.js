const customerRoutes = require('express').Router()
const saveImagesToGridFS = require('../middlewares/uploadBase64Image')
const { customerController } = require('../Controller/customerController');


customerRoutes.post('/updateCustomerDetails',saveImagesToGridFS, customerController.updateCustomerDetails);
customerRoutes.post('/getAllListingsForCustomer', customerController.getAllListingsForCustomer);

customerRoutes.post('/setFavItem', customerController.setFavItem);
customerRoutes.post('/setUnFavItem', customerController.setUnFavItem);
customerRoutes.post('/getListingForUser', customerController.getListingForUser);


module.exports = { customerRoutes };