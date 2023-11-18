const jwt = require('jwt-simple');
const configFile = require('../config');
const secret = configFile.secretKey;
const getToken = require('./getToken');
const { ObjectId } = require("mongodb");
const util = require('../utilities/util');
const curdOperations = require('../model/curdOperations');

module.exports = commonMiddlewares = {
    tokenValidate: async function (req, res, next) {
        try {
            let token = getToken(req.headers)
            if (token) {
                const decoded = util.decodeJWT(token, secret);
                if (!decoded) {
                    return res.status(401).send({ success: false, message: 'no Token Found', error: 'tokenError' });
                }
                if (!req.db) {
                    return res.status(500).send({ success: false, message: 'DB connection failed', error: 'Mongo Error!' });
                }
                let userData = await curdOperations.findOne(req.db, 'users', { _id: new ObjectId(decoded._id) });
                if (decoded && decoded.hasOwnProperty('tokenTime') && userData.tokenTime?.toString() == new Date(decoded.tokenTime)) {
                    req.user = decoded;
                    next();
                } else {
                    return res.status(401).send({ success: false, message: 'token Expired', error: 'tokenError' });
                };

            }
            else {
                res.status(401).send({ success: false, message: 'invalid token', error: 'tokenError' });
                res.end();
            }
        } catch (error) {
            console.log(error);
            next(error)
        };
    },
};
