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
                profileId: req.body.imageId,
                firstTimeLogin: false,
            };
            let updateUser = await curdOperations.updateOne(req.db, params, 'users', false);
            let latestUserData = await curdOperations.findOne(req.db, 'users', { _id: new ObjectId(req.user._id) });
            res.status(200).send({ success: true, code: 200, data: latestUserData, message: 'successfully Fectched userData.' });
        } catch (err) {
            res.status(500).send({ success: false, code: 500, error: err.message, message: 'something went wrong' })
        }
    },

    getAllListingsForCustomer: async (req, res) => {
        try {
            let query = [
                {
                    $lookup: {
                        from: "listingOrders",
                        localField: "_id",
                        foreignField: "refListingId",
                        as: "listingOrders"
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "refMakerId",
                        foreignField: "_id",
                        as: "makerData"
                    }
                },
                { $unwind: '$makerData' },
                {
                    $project: {
                        "makerData.kitchenImages": 0
                    }
                }
            ];
            let result = await curdOperations.aggregateQuery(req.db, 'listings', query);
            res.status(200).send({ success: true, code: 200, list: result, message: 'successfully Fectched list.' });
        } catch (err) {
            res.status(500).send({ success: false, code: 500, error: err.message, message: 'something went wrong' })
        }
    },

    setFavItem: async (req, res) => {
        try {
            let params = [];
            params['where'] = { refUserId: new ObjectId(req.user._id), refListingId: new ObjectId(req.body._id) };
            params['set'] = {
                refUserId: new ObjectId(req.user._id),
                refListingId: new ObjectId(req.body._id),
                favourite: true
            };
            let updateUser = await curdOperations.updateOne(req.db, params, 'favourites', true);
            res.status(200).send({ success: true, code: 200, data: {}, message: 'successfully updated favourite.' });
        } catch (err) {
            res.status(500).send({ success: false, code: 500, error: err.message, message: 'something went wrong' })
        }
    },

    setUnFavItem: async (req, res) => {
        try {
            let params = [];
            params['where'] = { refUserId: new ObjectId(req.user._id), refListingId: new ObjectId(req.body._id) };
            params['set'] = {
                refUserId: new ObjectId(req.user._id),
                refListingId: new ObjectId(req.body._id),
                favourite: false
            };
            let updateUser = await curdOperations.updateOne(req.db, params, 'favourites', true);
            res.status(200).send({ success: true, code: 200, data: {}, message: 'successfully updated favourite.' });
        } catch (err) {
            res.status(500).send({ success: false, code: 500, error: err.message, message: 'something went wrong' })
        }
    },

    getListingForUser: async (req, res) => {
        try {
            let query = [
                {
                    $match: {
                        _id: new ObjectId(req.body._id)
                    }
                },
                {
                    $lookup: {
                        from: "listingOrders",
                        localField: "_id",
                        foreignField: "refListingId",
                        as: "listingOrders"
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "refMakerId",
                        foreignField: "_id",
                        as: "makerData"
                    }
                },
                { $unwind: '$makerData' },
                {
                    $project: {
                        "makerData.kitchenImages": 0
                    }
                },
                {
                    $lookup: {
                        from: "favourites",
                        as: "favourites",
                        let: { refUserId: new ObjectId(req.user._id), refListingId: new ObjectId(req.body._id) },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$refUserId", "$$refUserId"] },
                                            { $eq: ["$refListingId", "$$refListingId"] },
                                        ]
                                    },
                                }
                            }
                        ]
                    }
                },
                {
                    $lookup: {
                        from: "customerAddress",
                        as: "customerAddress",
                        let: { refCustomerId: new ObjectId(req.user._id), default: true },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$refCustomerId", "$$refCustomerId"] },
                                            { $eq: ["$default", "$$default"] },
                                        ]
                                    },
                                }
                            }
                        ]
                    }
                },
                {
                    $addFields: {
                        favourite: { $arrayElemAt: ["$favourites.favourite", 0] },
                        customerAddress: { $arrayElemAt: ["$customerAddress", 0] },
                        favourites: '$$REMOVE',
                    }
                },
            ];
            let result = await curdOperations.aggregateQuery(req.db, 'listings', query);
            result = result.length > 0 ? result[0] : {};
            res.status(200).send({ success: true, code: 200, data: result, message: 'successfully Fectched listingData.' });
        } catch (err) {
            res.status(500).send({ success: false, code: 500, error: err.message, message: 'something went wrong' })
        }
    },

    addCustomerAddress: async (req, res) => {
        try {
            let defaultDoc = await curdOperations.findOne(req.db, 'customerAddress', { refCustomerId: new ObjectId(req.user._id), default: true });
            let obj = {
                refCustomerId: new ObjectId(req.user._id),
                default: defaultDoc ? false : true,
                ...req.body
            }
            let insertDoc = await curdOperations.insertOne(req.db, 'customerAddress', obj);
            res.status(200).send({ success: true, code: 200, data: {}, message: 'successfully saved Address.' });
        } catch (err) {
            res.status(500).send({ success: false, code: 500, error: err.message, message: 'something went wrong' })
        }
    },

    getCustomerAddress: async (req, res) => {
        try {
            let docs = await curdOperations.findAll(req.db, 'customerAddress', { refCustomerId: new ObjectId(req.user._id) });
            res.status(200).send({ success: true, code: 200, data: docs, message: 'successfully Fectched Address List.' });
        } catch (err) {
            res.status(500).send({ success: false, code: 500, error: err.message, message: 'something went wrong' })
        }
    },

    setDefaultAddress: async (req, res) => {
        try {
            let { _id } = { ...req.body };
            let params = [];
            params['where'] = { _id: new ObjectId(_id) };
            params['set'] = { default: true };
            let updateList = await curdOperations.updateMany(req.db, 'customerAddress', { refCustomerId: new ObjectId(req.user._id) }, { default: false }, false);
            let updateAsDefault = await curdOperations.updateOne(req.db, params, 'customerAddress', false);
            let docs = await curdOperations.findAll(req.db, 'customerAddress', { refCustomerId: new ObjectId(req.user._id) });
            res.status(200).send({ success: true, code: 200, data: docs, message: 'successfully Fectched Address List.' });
        } catch (err) {
            res.status(500).send({ success: false, code: 500, error: err.message, message: 'something went wrong' })
        }
    },

    deleteAddress: async (req, res) => {
        try {
            let _id = new ObjectId(req.body._id);
            let result = await curdOperations.deleteOne(req.db, 'customerAddress', { _id: _id });
            let docs = await curdOperations.findAll(req.db, 'customerAddress', { refCustomerId: new ObjectId(req.user._id) });
            res.status(200).send({ success: true, code: 200, data: docs, message: 'successfully Fectched Address List.' });
        } catch (err) {
            res.status(500).send({ success: false, code: 500, error: err.message, message: 'something went wrong' })
        }
    },

    addToCart: async (req, res) => {
        try {
            let obj = {
                refCustomerId: new ObjectId(req.user._id),
                ...req.body
            }
            let insertDoc = await curdOperations.insertOne(req.db, 'ordersTemp', obj);
            res.status(200).send({ success: true, code: 200, data: {}, message: 'successfully added to cart.' });
        } catch (err) {
            res.status(500).send({ success: false, code: 500, error: err.message, message: 'something went wrong' })
        }
    },
}

module.exports = { customerController };