const { ObjectId } = require("mongodb");
const curdOperations = require("../model/curdOperations");
const adminController = {
    getUsersCount: async (req, res) => {
        try {
            let count = await curdOperations.countModel(req.db, 'users', { _id: { $ne: new ObjectId(req.user._id) }, role: { $ne: 'admin' } });
            res.status(200).send({ success: true, code: 200, data: count, message: 'successfully Fectched user count.' });
        } catch (err) {
            res.status(500).send({ success: false, code: 500, error: err.message, message: 'something went wrong' })
        }
    },

    getOrdersCount: async (req, res) => {
        try {
            let count = await curdOperations.countModel(req.db, 'orders', {});
            res.status(200).send({ success: true, code: 200, data: count, message: 'successfully Fectched Orders count.' });
        } catch (err) {
            res.status(500).send({ success: false, code: 500, error: err.message, message: 'something went wrong' })
        }
    },

    getAllUsersList: async (req, res) => {
        try {
            let { selectedTab } = req.body;
            let match = { _id: { $ne: new ObjectId(req.user._id) }, role: { $ne: 'admin' } }
            if (selectedTab == 'maker' || selectedTab == 'customer') {
                match = { ...match, role: selectedTab };
            }
            if (selectedTab == 'draft') {
                match = { ...match, draft: true };
            }
            if (selectedTab == 'inactive') {
                match = { ...match, activeUser: false };
            }
            let list = await curdOperations.findAll(req.db, 'users', match);
            res.status(200).send({ success: true, code: 200, data: list, message: 'successfully Fectched Users List.' });
        } catch (err) {
            res.status(500).send({ success: false, code: 500, error: err.message, message: 'something went wrong' })
        }
    },

    getUserBasedOnId: async (req, res) => {
        try {
            let user = await curdOperations.findOne(req.db, 'users', { _id: new ObjectId(req.body._id) });
            res.status(200).send({ success: true, code: 200, data: user, message: 'successfully Fectched userData' });
        } catch (err) {
            res.status(500).send({ success: false, code: 500, error: err.message, message: 'something went wrong' })
        }
    },

    activeDeActiveUser: async (req, res) => {
        try {
            let params = {};
            params['where'] = { _id: new ObjectId(req.body._id) };
            params['set'] = { activeUser: !req.body.value };
            let updateUser = await curdOperations.updateOne(req.db, params, 'users', false);
            let user = await curdOperations.findOne(req.db, 'users', params['where']);
            res.status(200).send({ success: true, code: 200, data: user, message: 'successfully Fectched userData' });
        } catch (err) {
            res.status(500).send({ success: false, code: 500, error: err.message, message: 'something went wrong' })
        }
    },

    createMaker: async (req, res) => {
        try {
            let { userName, email, mobile, city, bio } = req.body;
            let exists = await curdOperations.findOne(req.db, 'users', { mobileNumber: mobile });
            if (!exists) {
                let orderCounter = await curdOperations.findOneAndUpdate(req.db, 'counters', { "name": "maker" }, { "seqValue": 1 }, true, true);
                let userId = orderCounter.value.seqValue.toString().padStart(3, '0');
                let obj = {
                    userName: userName,
                    ID: userId,
                    mobileNumber: mobile,
                    email: email,
                    pin: '123456',
                    primaryRole: 'maker',
                    role: 'maker',
                    address: city,
                    profileId: req.body.imageId,
                    bio: bio,
                    draft: true,
                    activeUser: true,
                };
                let insertUser = await curdOperations.insertOne(req.db, 'users', obj);
                let userData = await curdOperations.findOne(req.db, 'users', { mobileNumber: mobile });
                res.status(200).send({ success: true, code: 200, data: userData, message: 'successfully Fectched makerData.' });
            } else {
                res.status(409).send({ success: false, code: 409, error: 'maker already exists', message: 'maker already exists' })
            }
        } catch (err) {
            res.status(500).send({ success: false, code: 500, error: err.message, message: 'something went wrong' })
        }
    },

    updateKitchenImages: async (req, res) => {
        try {
            let params = {};
            params['where'] = { mobileNumber: req.body.mobile };
            params['set'] = { kitchenImages: req.body.imageArray };
            let updateUser = await curdOperations.updateOne(req.db, params, 'users', false);
            let user = await curdOperations.findOne(req.db, 'users', params['where']);
            res.status(200).send({ success: true, code: 200, data: user, message: 'successfully Fectched userData' });
        } catch (err) {
            res.status(500).send({ success: false, code: 500, error: err.message, message: 'something went wrong' })
        }
    },

    updateBankDetails: async (req, res) => {
        try {
            let { _id, userName, email, mobile, city, bio, commission, accountName, accountNumber, accountType, bankName, ifscCode } = req.body;
            if (_id) {
                let params = {};
                params['where'] = { _id: new ObjectId(_id) };
                params['set'] = {
                    mobileNumber: mobile,
                    email: email,
                    primaryRole: 'maker',
                    role: 'maker',
                    draft: false,
                    activeUser: true,
                    userName: userName,
                    address: city,
                    bio,
                    commission, accountName, accountNumber, accountType, bankName, ifscCode
                };
                let updateUser = await curdOperations.updateOne(req.db, params, 'users', false);
                res.status(200).send({ success: true, code: 200, data: {}, message: 'successfully Fectched makerData.' });
            } else {
                res.status(404).send({ success: false, code: 404, error: 'user not found', message: 'user not found' })
            }
        } catch (err) {
            res.status(500).send({ success: false, code: 500, error: err.message, message: 'something went wrong' })
        }
    },

}

module.exports = { adminController };