const authRoutes = require('express').Router()
const { authController } = require('../Controller/authController');
const { tokenValidate } = require('../middlewares/commonMiddlewares');


authRoutes.post('/login', authController.login);
authRoutes.post('/logOut', tokenValidate, authController.logOut);
authRoutes.post('/createCustomer', authController.createCustomer);

module.exports = { authRoutes };