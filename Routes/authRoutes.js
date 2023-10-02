const auth = require('express').Router();
const authController = require('../Controller/authController');

auth.post('/login', authController.login);


module.exports = auth;