const authRoutes = require('express').Router()
const { authController } = require('../Controller/authController');
const { tokenValidate } = require('../middlewares/commonMiddlewares');


authRoutes.post('/login', authController.login);
authRoutes.post('/logOut', tokenValidate, authController.logOut);
authRoutes.post('/createCustomer', authController.registerCustomer);
authRoutes.post('/checkUserToken', authController.checkUserToken);
authRoutes.post('/getlogofile', authController.getlogofile);
authRoutes.post('/getAllListingsForCustomer', authController.getAllListingsForCustomer);
authRoutes.post('/getListingForUser', authController.getListingForUser);

module.exports = { authRoutes };