const adminRoutes = require('express').Router()
const { adminController } = require('../Controller/adminController');

adminRoutes.post('/getUsersCount', adminController.getUsersCount);
adminRoutes.post('/getOrdersCount', adminController.getOrdersCount);
adminRoutes.post('/getAllUsersList', adminController.getAllUsersList);
adminRoutes.post('/getUserBasedOnId', adminController.getUserBasedOnId);
adminRoutes.post('/ActiveDeActiveUser', adminController.activeDeActiveUser);

adminRoutes.post('/createMaker', adminController.createMaker);
adminRoutes.post('/updateBankDetails', adminController.updateBankDetails);

module.exports = { adminRoutes };