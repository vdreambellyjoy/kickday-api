const { ObjectId } = require("mongodb");
const curdOperations = require("../model/curdOperations");
const makerController = {
    getMakerDashboardData: async (req, res) => {
        try {
            let query = [
                { $match: { _id: new ObjectId(req.user._id) } },
                {
                    $lookup: {
                        from: "listings",
                        as: "listingsData",
                        let: { refMakerId: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            {
                                                $eq: ["$$refMakerId", "$refMakerId"]
                                            },
                                        ]
                                    }
                                }
                            },
                            {
                                $lookup: {
                                    from: "orders",
                                    localField: "_id",
                                    foreignField: "refListingId",
                                    as: "ordersData"
                                }
                            },
                            {
                                $addFields: {
                                    totalAmount: { $sum: "$ordersData.totalPrice" }
                                }
                            },
                        ],
                    },
                },
                {
                    $project: {
                        moneyEarnedWithOutCommission: { $sum: "$listingsData.totalAmount" },
                        listingsCount: { $size: '$listingsData' },
                        commission: { $ifNull: ["$commission", 0] },
                    }
                },
                {
                    $addFields: {
                        moneyEarned: {
                            $cond: {
                                if: { $eq: [{ $type: "$commission" }, "missing"] },
                                then: "$moneyEarnedWithOutCommission",
                                else: {
                                    $add: [
                                        "$moneyEarnedWithOutCommission",
                                        {
                                            $multiply: [
                                                { $convert: { input: "$moneyEarnedWithOutCommission", to: "double", onError: 0 } },
                                                { $divide: [{ $convert: { input: "$commission", to: "double", onError: 0 } }, 100] }
                                            ]
                                        }
                                    ]
                                }
                            }
                        }
                    }
                }
            ];
            let result = await curdOperations.aggregateQuery(req.db, 'users', query);
            result = result.length > 0 ? result[0] : {};
            res.status(200).send({ ...result, ...{ success: true, code: 200, message: 'successfully Fectched Dashboard Data' } });
        } catch (err) {
            res.status(500).send({ success: false, code: 500, error: err.message, message: 'something went wrong' })
        }
    },

    addEditListing: async (req, res) => {
        try {
            let { orders, _id, refMakerId } = { ...req.body };
            req.body.orderEndsOn = new Date(req.body.orderEndsOn);
            req.body.orderDeliveredOn = new Date(new Date(req.body.orderDeliveredOn).setHours(23, 59, 59));
            delete req.body.orders;
            if (!ObjectId.isValid(_id)) {
                req.body.refMakerId = new ObjectId(req.user._id);
                let orderCounter = await curdOperations.findOneAndUpdate(req.db, 'counters', { "name": "listing" }, { "seqValue": 1 }, true, true);
                let userId = orderCounter.value.seqValue.toString().padStart(3, '0');
                req.body.ID = `KICK${userId}`;
                let newDoc = await curdOperations.insertOne(req.db, 'listings', req.body);
                orders = orders.map(e => {
                    e.refListingId = newDoc.insertedId;
                    e.refMakerId = new ObjectId(req.user._id);
                    e.quantity = +e.quantity;
                    e.price = +e.price;
                    return e;
                });
                let insertDocs = await curdOperations.insertMany(req.db, 'listingOrders', orders);
                res.status(200).send({ success: true, code: 200, data: {}, message: 'successfully added Listing.' });
            } else {
                let deleteDoc = await curdOperations.deleteMany(req.db, 'listingOrders', { refListingId: new ObjectId(_id) });
                for (let order of orders) {
                    order.refListingId = new ObjectId(_id);
                    order.refMakerId = req.body.role == 'admin' ? new ObjectId(refMakerId) : new ObjectId(req.user._id);
                    order.quantity = +order.quantity;
                    order.price = +order.price;
                }
                let insertDocs = await curdOperations.insertMany(req.db, 'listingOrders', orders);
                delete req.body._id;
                delete req.body.refMakerId
                let params = {};
                params['where'] = { _id: new ObjectId(_id) };
                params['set'] = req.body;
                let updateUser = await curdOperations.updateOne(req.db, params, 'listings', false);
                res.status(200).send({ success: true, code: 200, data: {}, message: 'successfully updated Listing.' });
            }
        } catch (err) {
            console.log(err)
            res.status(500).send({ success: false, code: 500, error: err.message, message: 'something went wrong' })
        }
    },

    deleteListing: async (req, res) => {
        try {
            let _id = new ObjectId(req.body._id);
            let params = {};
            params['where'] = { _id };
            params['set'] = { delete: true };
            let updateUser = await curdOperations.updateOne(req.db, params, 'listings', false);
            // let result = await curdOperations.deleteOne(req.db, 'listings', { _id: _id });
            // let result2 = await curdOperations.deleteMany(req.db, 'listingOrders', { refListingId: _id });
            res.status(200).send({ success: true, code: 200, data: {}, message: 'successfully deleted listingData.' });
        } catch (err) {
            res.status(500).send({ success: false, code: 500, error: err.message, message: 'something went wrong' })
        }
    },

    changeOrderStatus: async (req, res) => {
        try {
            let _id = new ObjectId(req.body._id);
            let params = [];
            params['where'] = { _id: _id };
            params['set'] = { status: req.body.status, timeStamp: new Date() };
            let updateUser = await curdOperations.updateOne(req.db, params, 'orders', true);
            res.status(200).send({ success: true, code: 200, data: {}, message: 'successfully updated orderStatus.' });
        } catch (err) {
            res.status(500).send({ success: false, code: 500, error: err.message, message: 'something went wrong' })
        }
    },

    toggleMakerStatus: async (req, res) => {
        try {
            let _id = new ObjectId(req.user._id);
            let params = {};
            params['where'] = { _id };
            params['set'] = { role: req.body.value ? 'customer' : 'maker' };
            let updateUser = await curdOperations.updateOne(req.db, params, 'users', false);
            let user = await curdOperations.findOne(req.db, 'users', { _id: _id });
            res.status(200).send({ success: true, code: 200, userData: user, message: 'successfully updated role.' });
        } catch (err) {
            res.status(500).send({ success: false, code: 500, error: err.message, message: 'something went wrong' })
        }
    },
}

module.exports = { makerController };