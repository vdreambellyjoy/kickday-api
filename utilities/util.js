const bcrypt = require('bcrypt');
const jwt = require('jwt-simple');
module.exports = {

    generateJWT: (inputObj, expiryTime) => {
        return jwt.sign(inputObj, 'secretKey', { expiresIn: '23h' })
    },

    decodeJWT: (token, secrtekey) => {
        try {
            return jwt.decode(token, secrtekey);
        } catch (err) {
            return null;
        }
    },

    // Function to hash a password
    generateHashPassword: async (password) => {
        try {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            return hashedPassword;
        } catch (err) {
            throw new Error('Error hashing password');
        }
    },

    // Function to compare a password with a hashed password
    comparePasswords: async (password, hashedPassword) => {
        try {
            const match = await bcrypt.compare(password, hashedPassword);
            return match;
        } catch (err) {
            throw new Error('Error comparing passwords');
        }
    }
}
