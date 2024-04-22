const {MongoClient} = require('mongodb');
const configUrl = require('./config');

module.exports = async function() {
    return new Promise(async(resolve, reject) => {
        connect().then((database) => {
            console.log('db connected');
            resolve(database);
        }).catch(err => {
            reject(err)
        })
    });
}

connect = async () => {
    let databaseName = "kickDay";
    console.log(databaseName,configUrl.db_url, 13);
    var conn = await MongoClient.connect(configUrl.db_url)
    return conn.db(databaseName)
   
}

// connect mongodb in node js?
