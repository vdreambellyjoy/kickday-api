const jwt = require('jwt-simple');
const configFile = require('../config');
const secret = configFile.secretKey;
const { ObjectId } = require('mongodb');
const util = require('../utilities/util');
const readfileFromGridFs = require('../middlewares/gridFsRead');
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

    registerCustomer: async (req, res) => {
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

    getlogofile: async (req, res) => {
        try {
            const { fileId } = { ...req.body };
            const fileObject = await readfileFromGridFs(fileId, req.db);
            res.json({ ...fileObject });
        } catch (err) {
            res.status(500).send({ success: false, code: 500, error: err, message: 'something went wrong' })
        }
    },

    checkUserToken: async (req, res) => {
        try {
            if (req.body.token) {
                let parted = req.body.token.split(' ');
                let realToken = parted.length === 2 ? parted[1] : null;
                const decoded = util.decodeJWT(realToken, secret);
                if (!decoded) {
                    return res.status(401).send({ success: false, message: 'no Token Found', error: 'tokenError' });
                }
                if (!req.db) {
                    return res.status(500).send({ success: false, message: 'DB connection failed', error: 'Mongo Error!' });
                }
                let userData = await curdOperations.findOne(req.db, 'users', { _id: new ObjectId(decoded._id) });
                if (decoded && decoded.hasOwnProperty('tokenTime') && userData.tokenTime?.toString() == new Date(decoded.tokenTime)) {
                    return res.status(200).send({ success: true, code: 200, data: userData, message: 'successfully Fectched userData.' });
                } else {
                    return res.status(401).send({ success: false, message: 'token Expired', error: 'tokenError' });
                };
            }
            else {
                res.status(401).send({ success: false, message: 'invalid token', error: 'tokenError' });
                return res.end();
            }
        } catch (err) {
            return res.status(500).send({ success: false, code: 500, error: err, message: 'something went wrong' })
        }
    },

    getAllListingsForCustomer: async (req, res) => {
        try {
            let query = [
                {
                    $match: {
                        delete: { $ne: true },
                        deActive: { $ne: true },
                        orderDeliveredOn: { $gte: new Date() }
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
                }
            ];
            let finalQuery = [];
            let match = {};
            if (req.body.search) {
                match = {
                    ...match,
                    "address": { "$regex": req.body.search, "$options": "i" },
                }
            }
            if (req.body.deliveryType) {
                match = {
                    ...match,
                    "deliveryOptions": { "$elemMatch": { "type": req.body.deliveryType } },
                }
            }
            if (req.body.deliveryDate) {
                if (req.body.deliveryDate == "Available Today") {
                    let today = new Date();
                    let startOfDay = new Date(today);
                    startOfDay.setHours(0, 0, 0, 0);
                    let endOfDay = new Date(today);
                    endOfDay.setHours(23, 59, 59, 999);
                    match = {
                        ...match,
                        "timeStamp": { "$gte": startOfDay, "$lte": endOfDay }
                    }
                }
                else if (req.body.deliveryDate == "Available Tomorrow") {
                    let tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    let startOfTomorrow = new Date(tomorrow);
                    startOfTomorrow.setHours(0, 0, 0, 0);
                    let endOfTomorrow = new Date(tomorrow);
                    endOfTomorrow.setHours(23, 59, 59, 999);
                    match = {
                        ...match,
                        "timeStamp": { "$gte": startOfTomorrow, "$lte": endOfTomorrow }
                    }
                }
                else if (req.body.deliveryDate == "This Week") {
                    let today = new Date();
                    let startOfWeek = new Date(today);
                    startOfWeek.setDate(today.getDate() - today.getDay());
                    startOfWeek.setHours(0, 0, 0, 0);
                    let endOfWeek = new Date(today);
                    endOfWeek.setDate(endOfWeek.getDate() + (6 - today.getDay()));
                    endOfWeek.setHours(23, 59, 59, 999);
                    match = {
                        ...match,
                        "timeStamp": { "$gte": startOfWeek, "$lte": endOfWeek }
                    }
                }
                else if (req.body.deliveryDate == "This Month") {
                    let today = new Date();
                    let startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                    startOfMonth.setHours(0, 0, 0, 0);
                    let endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                    endOfMonth.setHours(23, 59, 59, 999);
                    match = {
                        ...match,
                        "timeStamp": { "$gte": startOfMonth, "$lte": endOfMonth }
                    }
                }

            }
            if (req.body.search || req.body.deliveryType || req.body.deliveryDate) {
                finalQuery = [{ $match: match }]
            }
            finalQuery = finalQuery.concat(query);
            let result = await curdOperations.aggregateQuery(req.db, 'listings', finalQuery);
            res.status(200).send({ success: true, code: 200, data: result, message: 'successfully Fectched list.' });
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
                        let: { refUserId: new ObjectId(req.user?._id), refListingId: "$_id" },
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
                    $addFields: {
                        favourite: { $arrayElemAt: ["$favourites.favourite", 0] },
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
}

module.exports = { authController };