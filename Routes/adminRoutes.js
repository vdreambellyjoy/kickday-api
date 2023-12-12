const adminRoutes = require('express').Router()
const { adminController } = require('../Controller/adminController');
const saveImageToGridFS = require('../middlewares/uploadBase64Image')


adminRoutes.post('/getUsersCount', adminController.getUsersCount);
adminRoutes.post('/getOrdersCount', adminController.getOrdersCount);
adminRoutes.post('/getAllUsersList', adminController.getAllUsersList);
adminRoutes.post('/getUserBasedOnId', adminController.getUserBasedOnId);
adminRoutes.post('/ActiveDeActiveUser', adminController.activeDeActiveUser);

adminRoutes.post('/createMaker', saveImageToGridFS, adminController.createMaker);
adminRoutes.post('/updateBankDetails', adminController.updateBankDetails);

module.exports = { adminRoutes };