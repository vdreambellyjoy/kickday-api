const auth = require('express').Router();
const authController = require('../Controller/authController');

auth.post('/login', authController.login);
auth.post('/saveProfile', authController.saveProfile);
auth.post('/saveBankDetails', authController.saveBankDetails);
auth.post('/getMakers', authController.getMakers);
auth.post('/getMakerById', authController.getMakerById);


module.exports = auth;