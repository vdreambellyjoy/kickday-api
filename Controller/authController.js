const jwt = require('jwt-simple');
const configFile = require('../config');
const secret = configFile.secretKey
const { ObjectId } = require('mongodb');
const curdOperations = require('../model/curdOperations');


const authController = {
    login: async (req, res) => {
        try {
            let { mobile, pin } = req.body;
            let userData = await curdOperations.findOne(req.db, 'users', { mobileNumber: mobile, pin: pin });
            if (userData) {
                let params = {};
                params['where'] = { mobileNumber: mobile };
                params['set'] = {
                    tokenTime: new Date(),
                    lastActiveTime: new Date()
                };
                let updateUser = await curdOperations.updateOne(req.db, params, 'users', false);
                let latestUserData = await curdOperations.findOne(req.db, 'users', { mobileNumber: mobile });
                const token = jwt.encode(latestUserData, secret);
                res.status(200).send({ success: true, code: 200, firstTimeLogin: latestUserData.firstTimeLogin || false, token: 'JWT ' + token, userData: latestUserData, message: 'successfully Fectched userData.' });
            } else {
                res.status(404).send({ success: false, code: 404, error: 'user not found', message: 'user not found' })
            }
        } catch (err) {
            res.status(500).send({ success: false, code: 500, error: err, message: 'something went wrong' })
        }
    },

    logOut: async (req, res) => {
        try {
            let params = {};
            params['where'] = { _id: new ObjectId(req.user._id) };
            params['set'] = { tokenTime: "", lastActiveTime: "" };
            let updateUser = await curdOperations.updateOne(req.db, params, 'users', false);
            res.status(200).send({ success: true, code: 200, message: 'successfully logout user.' });
        } catch (err) {
            res.status(500).send({ success: false, code: 500, error: err, message: 'something went wrong' })
        }
    },

    createCustomer: async (req, res) => {
        try {
            let { mobile, pin, role } = req.body;
            let exists = await curdOperations.findOne(req.db, 'users', { mobileNumber: mobile });
            if (!exists) {
                let obj = {
                    mobileNumber: mobile,
                    pin: pin,
                    primaryRole: 'customer',
                    role: 'customer',
                    activeUser: true,
                    firstTimeLogin: true,
                    tokenTime: new Date(),
                    lastActiveTime: new Date(),
                }
                let insertUser = await curdOperations.insertOne(req.db, 'users', obj);
                let userData = await curdOperations.findOne(req.db, 'users', { mobileNumber: mobile });
                const token = jwt.encode(userData, secret);
                res.status(200).send({ success: true, code: 200, firstTimeLogin: userData.firstTimeLogin || false, token: 'JWT ' + token, userData: userData, message: 'successfully Fectched userData.' });
            } else {
                res.status(409).send({ success: false, code: 409, error: 'user already exists', message: 'user already exists' })
            }
        } catch (err) {
            res.status(500).send({ success: false, code: 500, error: err, message: 'something went wrong' })
        }
    },
}

module.exports = { authController };