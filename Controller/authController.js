const jwt = require('jwt-simple');
const configFile = require('../config');
const authModel = require('../Model/authModel')
const { ObjectId } = require('mongodb');


const authController = {
    login: async (req, res) => {
        try {
            let update = await req.mongoConnection.collection('users').updateOne(
                {email: req.body.email},
                { $set : {...req.body, adminUser: req.body.email == 'premkumar.231996@gmail.com'}},
                {upsert: true}
            )
            let userData = await req.mongoConnection.collection('users').findOne({email: req.body.email});
            console.log(update);
            let Jwttoken = jwt.encode(userData, configFile.secretKey);
            if (userData) {
                res.status(200).send({ success: true, code: 200, data: userData, token: Jwttoken, message: 'success' })
            } else {
                res.status(400).send({ success: false, code: 400, data: userData, message: 'something went wrong' })
            }
            // res.status(200).send({success: true, code: 200, data: email, message: 'success'})
        } catch (err) {
            console.log(err, 8787);
            // await logErrors({mongoConnection: req.mongoConnection, err});
            res.send({ success: false, code: 500, data: err, message: 'something went wrong' })
        }
    },
    saveProfile: async (req, res) => {
        try {
            let update = await req.mongoConnection.collection('users').updateOne(
                {email: req.body.email},
                { $set : {profile: req.body, isMaker: true}},
                {upsert: true}
            )
            if (update) {
                res.status(200).send({ success: true, code: 200, data: update, message: 'success' })
            } else {
                res.status(400).send({ success: false, code: 400, data: update, message: 'something went wrong' })
            }
        } catch(err) {
            console.log(err, 8787);
            // await logErrors({mongoConnection: req.mongoConnection, err});
            res.send({ success: false, code: 500, data: err, message: 'something went wrong' })
        }
    },
    saveBankDetails: async (req, res) => {
        try {
            let update = await req.mongoConnection.collection('users').updateOne(
                {email: req.body.email},
                { $set : { ...req.body, draftDone: true}},
                {upsert: true}
            )
            if (update) {
                res.status(200).send({ success: true, code: 200, data: update, message: 'success' })
            } else {
                res.status(400).send({ success: false, code: 400, data: update, message: 'something went wrong' })
            }
        } catch(err) {
            console.log(err, 8787);
            // await logErrors({mongoConnection: req.mongoConnection, err});
            res.send({ success: false, code: 500, data: err, message: 'something went wrong' })
        }
    },
    getMakers: async (req, res) => {
        try {
            let match = {email: {$ne: 'premkumar.231996@gmail.com'}}
            if (req.body.match == 'all') {

            } else if (req.body.match == 'isMaker') {
                match = { email: {$ne: 'premkumar.231996@gmail.com'}, draftDone: true}
            } else if (req.body.match == 'draftDone') {
                match = { email: {$ne: 'premkumar.231996@gmail.com'}, draftDone: {$exists: false}}
            }
            console.log(req.body);
            let list = await req.mongoConnection.collection('users').find(match).toArray();
            res.status(200).send({ success: true, code: 200, data: list, message: 'success' })
        } catch(err) {
            console.log(err, 8787);
            // await logErrors({mongoConnection: req.mongoConnection, err});
            res.send({ success: false, code: 500, data: err, message: 'something went wrong' })
        }
    },
    getMakerById: async (req, res) => {
        try {
            let data = await req.mongoConnection.collection('users').findOne({_id: req._id})
            res.status(200).send({ success: true, code: 200, data: data, message: 'success' })
        } catch(err) {
            console.log(err, 8787);
            // await logErrors({mongoConnection: req.mongoConnection, err});
            res.send({ success: false, code: 500, data: err, message: 'something went wrong' })
        }
    }
}

module.exports = authController;