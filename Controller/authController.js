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
}

module.exports = authController;