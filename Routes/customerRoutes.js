const customerRoutes = require('express').Router()
const saveImagesToGridFS = require('../middlewares/uploadBase64Image')
const { customerController } = require('../Controller/customerController');


customerRoutes.post('/updateCustomerDetails',saveImagesToGridFS, customerController.updateCustomerDetails);
customerRoutes.post('/getCustomerOrders', customerController.getCustomerOrders);

customerRoutes.post('/setFavItem', customerController.setFavItem);
customerRoutes.post('/setUnFavItem', customerController.setUnFavItem);
customerRoutes.post('/addCustomerAddress', customerController.addCustomerAddress);
customerRoutes.post('/getCustomerAddress', customerController.getCustomerAddress);
customerRoutes.post('/setDefaultAddress', customerController.setDefaultAddress);
customerRoutes.post('/deleteAddress', customerController.deleteAddress);
customerRoutes.post('/addToCart', customerController.addToCart);
customerRoutes.post('/getCustomerOrderSummary', customerController.getCustomerOrderSummary);
customerRoutes.post('/placeOrder', customerController.placeOrder);
customerRoutes.post('/deleteTempOrder', customerController.deleteTempOrder);



module.exports = { customerRoutes };