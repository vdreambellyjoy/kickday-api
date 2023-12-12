const customerRoutes = require('express').Router()
const saveImageToGridFS = require('../middlewares/uploadBase64Image')
const { customerController } = require('../Controller/customerController');


customerRoutes.post('/updateCustomerDetails',saveImageToGridFS, customerController.updateCustomerDetails);
customerRoutes.post('/getAllListingsForCustomer',saveImageToGridFS, customerController.getAllListingsForCustomer);


module.exports = { customerRoutes };