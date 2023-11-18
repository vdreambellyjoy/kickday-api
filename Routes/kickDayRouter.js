const kickDayRouter = require('express').Router();

const { authRoutes } = require('./authRoutes');
const { adminRoutes } = require('./adminRoutes');
const { tokenValidate } = require('../middlewares/commonMiddlewares');


kickDayRouter.use('/auth', authRoutes);
kickDayRouter.use('/admin', tokenValidate, adminRoutes);



module.exports = { kickDayRouter };