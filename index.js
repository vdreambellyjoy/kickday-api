const port = 3800;
const cors = require('cors');
const express = require('express');
const app = express();
const apiRoutes = express.Router();
const dbConnection = require('./dbConnection');
app.use(express.json({ limit: '200mb' }))
app.use(cors())
app.use(express.urlencoded({ extended: true, limit: "200mb" }));
const scripts = require('./scripts');

let db;

dbConnection().then(async val => {
    db = val;
    scripts.executekickDayScripts1_0(false, db);
}).catch(err => {
    console.log(err);
})

app.use((req, res, next) => {
    if (!db) {
        dbConnection().then(val => {
            db = val;
            req.db = db
            next()
        }).catch(err => {
            console.log(err);
            res.send({ success: false, error: "Mongo Error!" });
        })
    } else {
        req.db = db;
        next()
    }
})

const { kickDayRouter } = require('./Routes/kickDayRouter');
apiRoutes.use('/kickDay', kickDayRouter);
app.use(apiRoutes)




app.listen(port, () => {
    console.log('server running on port:' + port);
})
