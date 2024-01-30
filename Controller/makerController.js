const { ObjectId } = require("mongodb");
const curdOperations = require("../model/curdOperations");
const makerController = {
    getMakerDashboardData: async (req, res) => {
        try {
            let count = await curdOperations.countModel(req.db, 'listings', { refMakerId: new ObjectId(req.user._id) });
            res.status(200).send({ success: true, code: 200, listingsCount: count, moneyEarned: 4444, message: 'successfully Fectched Dashboard Data' });
        } catch (err) {
            res.status(500).send({ success: false, code: 500, error: err.message, message: 'something went wrong' })
        }
    },

    addEditListing: async (req, res) => {
        try {
            let { orders, _id } = { ...req.body };
            req.body.refMakerId = new ObjectId(req.user._id);
            req.body.orderEndsOn = new Date(new Date(req.body.orderEndsOn).setHours(23, 59, 59));
            req.body.orderDeliveredOn = new Date(new Date(req.body.orderDeliveredOn).setHours(23, 59, 59));
            delete req.body.orders;
            if (!ObjectId.isValid(_id)) {
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
                })
                let insertDocs = await curdOperations.insertMany(req.db, 'listingOrders', orders);
                res.status(200).send({ success: true, code: 200, data: {}, message: 'successfully added Listing.' });
            } else {
                let deleteDoc = await curdOperations.deleteMany(req.db, 'listingOrders', { refListingId: new ObjectId(_id) });
                for (let order of orders) {
                    order.refListingId = new ObjectId(_id);
                    order.refMakerId = new ObjectId(req.user._id);
                    orders.quantity = +orders.quantity
                }
                let insertDocs = await curdOperations.insertMany(req.db, 'listingOrders', orders);
                delete req.body._id;
                let params = {};
                params['where'] = { _id: new ObjectId(_id) };
                params['set'] = req.body
                let updateUser = await curdOperations.updateOne(req.db, params, 'listings', false);
                res.status(200).send({ success: true, code: 200, data: {}, message: 'successfully updated Listing.' });
            }
        } catch (err) {
            res.status(500).send({ success: false, code: 500, error: err.message, message: 'something went wrong' })
        }
    },

    deleteListing: async (req, res) => {
        try {
            let _id = new ObjectId(req.body._id);
            let result = await curdOperations.deleteOne(req.db, 'listings', { _id: _id });
            let result2 = await curdOperations.deleteMany(req.db, 'listingOrders', { refListingId: _id });
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
            params['set'] = { status: req.body.status };
            let updateUser = await curdOperations.updateOne(req.db, params, 'orders', true);
            res.status(200).send({ success: true, code: 200, data: {}, message: 'successfully updated orderStatus.' });
        } catch (err) {
            res.status(500).send({ success: false, code: 500, error: err.message, message: 'something went wrong' })
        }
    },
}

module.exports = { makerController };