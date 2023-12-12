const customerRoutes = require('express').Router()
const saveImagesToGridFS = require('../middlewares/uploadBase64Image')
const { customerController } = require('../Controller/customerController');


customerRoutes.post('/updateCustomerDetails',saveImagesToGridFS, customerController.updateCustomerDetails);
customerRoutes.post('/getAllListingsForCustomer',saveImagesToGridFS, customerController.getAllListingsForCustomer);


module.exports = { customerRoutes };