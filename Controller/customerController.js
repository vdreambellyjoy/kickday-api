const { ObjectId } = require("mongodb");
const curdOperations = require("../model/curdOperations");
const customerController = {
    updateCustomerDetails: async (req, res) => {
        try {
            let params = {};
            params['where'] = { _id: new ObjectId(req.user._id) };
            params['set'] = {
                userName: req.body.userName,
                email: req.body.email,
                address: req.body.city,
                bio: req.body.bio,
                imageId: req.body.imageId,
                firstTimeLogin: false,
            };
            let updateUser = await curdOperations.updateOne(req.db, params, 'users', false);
            let latestUserData = await curdOperations.findOne(req.db, 'users', { _id: new ObjectId(req.user._id) });
            res.status(200).send({ success: true, code: 200, userData: latestUserData, message: 'successfully Fectched userData.' });
        } catch (err) {
            res.status(500).send({ success: false, code: 500, error: err.message, message: 'something went wrong' })
        }
    },

    getAllListingsForCustomer: async (req, res) => {
        try {
            let params = {};
            params['where'] = { _id: new ObjectId(req.user._id) };
            params['set'] = {
                userName: req.body.userName,
                email: req.body.email,
                address: req.body.city,
                bio: req.body.bio,
                imageId: req.body.imageId,
                firstTimeLogin: false,
            };
            let updateUser = await curdOperations.updateOne(req.db, params, 'users', false);
            let latestUserData = await curdOperations.findOne(req.db, 'users', { _id: new ObjectId(req.user._id) });
            res.status(200).send({ success: true, code: 200, userData: latestUserData, message: 'successfully Fectched userData.' });
        } catch (err) {
            res.status(500).send({ success: false, code: 500, error: err.message, message: 'something went wrong' })
        }
    },

}

module.exports = { customerController };