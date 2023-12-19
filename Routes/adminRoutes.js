const adminRoutes = require('express').Router()
const { adminController } = require('../Controller/adminController');
const saveImagesToGridFS = require('../middlewares/uploadBase64Image')



adminRoutes.post('/getUsersCount', adminController.getUsersCount);
adminRoutes.post('/getAllUsersList', adminController.getAllUsersList);
adminRoutes.post('/getUserOverView', adminController.getUserOverView);
adminRoutes.post('/getUserBasedOnId', adminController.getUserBasedOnId);
adminRoutes.post('/ActiveDeActiveUser', adminController.activeDeActiveUser);

adminRoutes.post('/getAllListings', adminController.getAllListings);
adminRoutes.post('/getListingsCount', adminController.getListingsCount);
adminRoutes.post('/getListingBasedOnId', adminController.getListingBasedOnId);

adminRoutes.post('/createMaker', saveImagesToGridFS, adminController.createMaker);
adminRoutes.post('/updateKitchenImages', saveImagesToGridFS, adminController.updateKitchenImages);
adminRoutes.post('/updateBankDetails', adminController.updateBankDetails);

module.exports = { adminRoutes };