const kickDayRouter = require('express').Router();

const { authRoutes } = require('./authRoutes');
const { adminRoutes } = require('./adminRoutes');
const { makerRoutes } = require('./makerRoutes');
const { customerRoutes } = require('./customerRoutes');
const { tokenValidate } = require('../middlewares/commonMiddlewares');


kickDayRouter.use('/auth', authRoutes);
kickDayRouter.use('/admin', tokenValidate, adminRoutes);
kickDayRouter.use('/maker', tokenValidate, makerRoutes);
kickDayRouter.use('/customer', tokenValidate, customerRoutes);



module.exports = { kickDayRouter };