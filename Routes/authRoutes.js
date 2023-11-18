const authRoutes = require('express').Router()
const { authController } = require('../Controller/authController');

authRoutes.post('/login', authController.login);
authRoutes.post('/createCustomer', authController.createCustomer);

module.exports = { authRoutes };