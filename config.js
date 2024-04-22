require('dotenv').config({ path: './kickday.env' });

module.exports = {
    db_url: process.env.ENV_db_url,
    port: process.env.ENV_port,
    secretKey: process.env.ENV_secret
}

