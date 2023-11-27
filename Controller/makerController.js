const { ObjectId } = require("mongodb");
const curdOperations = require("../model/curdOperations");
const makerController = {
    getMakerDashboardData: async (req, res) => {
        try {
            let count = await curdOperations.countModel(req.db, 'listings', { makerId: new ObjectId(req.user._id) });
            res.status(200).send({ success: true, code: 200, listingsCount: count, moneyEarned: 4444, message: 'successfully Fectched Dashboard Data' });
        } catch (err) {
            res.status(500).send({ success: false, code: 500, error: err.message, message: 'something went wrong' })
        }
    },

    addListing: async (req, res) => {
        try {
            let { orders } = { ...req.body };
            req.body.makerId = new ObjectId(req.user._id);
            req.body.startDateTime = new Date(req.body.startDateTime);
            req.body.endDateTime = new Date(req.body.endDateTime);
            delete req.body.orders;
            let newDoc = await curdOperations.insertOne(req.db, 'listings', req.body);
            for (let order of orders) {
                order.refListingId = newDoc.insertedId;
                order.makerId = new ObjectId(req.user._id);
            }
            let insertDocs = await curdOperations.insertMany(req.db, 'listingOrders', orders);
            res.status(200).send({ success: true, code: 200, data: {}, message: 'successfully added Listing.' });
        } catch (err) {
            res.status(500).send({ success: false, code: 500, error: err.message, message: 'something went wrong' })
        }
    },

    getMakerListings: async (req, res) => {
        try {
            let makerId = new ObjectId(req.user._id);
            let query = [
                { $match: { makerId: makerId } },
                {
                    $lookup: {
                        from: "listingOrders",
                        localField: "_id",
                        foreignField: "refListingId",
                        as: "listingOrders"
                    }
                },
                { $sort: { _id: -1 } }
            ];
            let result = await curdOperations.aggregateQuery(req.db, 'listings', query)
            res.status(200).send({ success: true, code: 200, data: result, message: 'successfully Fectched maker listingsData.' });
        } catch (err) {
            res.status(500).send({ success: false, code: 500, error: err.message, message: 'something went wrong' })
        }
    },

    getListingBasedOnId: async (req, res) => {
        try {
            let _id = new ObjectId(req.body._id);
            let query = [
                { $match: { _id: _id } },
                {
                    $lookup: {
                        from: "listingOrders",
                        localField: "_id",
                        foreignField: "refListingId",
                        as: "listingOrders"
                    }
                }
            ];
            let result = await curdOperations.aggregateQuery(req.db, 'listings', query);
            let resultCopy = result.length ? result[0] : {};
            res.status(200).send({ success: true, code: 200, data: resultCopy, message: 'successfully Fectched maker listingData.' });
        } catch (err) {
            res.status(500).send({ success: false, code: 500, error: err.message, message: 'something went wrong' })
        }
    },

    deleteListing: async (req, res) => {
        try {
            let _id = new ObjectId(req.body._id);
            let result = await curdOperations.deleteOne(req.db, 'listings', { _id: _id });
            let result2 = await curdOperations.deleteMany(req.db, 'listingOrders', { refListingId: _id });
            res.status(200).send({ success: true, code: 200, listings: result, orders: result2, message: 'successfully deleted listingData.' });
        } catch (err) {
            res.status(500).send({ success: false, code: 500, error: err.message, message: 'something went wrong' })
        }
    },

}

module.exports = { makerController };