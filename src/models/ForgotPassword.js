const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ForgotPasswordSchema = new Schema({
    token: {
        type: String,
        unique: true
    },
    email: String,
    expiryTime: Date
});

const ForgotPasswordObj = mongoose.model('ForgotPassword', ForgotPasswordSchema);
module.exports = ForgotPasswordObj;