const mongoose = require('mongoose');

const AccountVerifcationSchema = new mongoose.Schema({
    mobilePhone: String,
    type: String,
    email: { type: String, lowercase: true, trim: true },
    verificationCode: { type: Number, maxLength: 6 },
    expiryTime: Date
}, { timestamps: true });

const AccountVerifcationObj = mongoose.model('AccountVerifcation', AccountVerifcationSchema);
module.exports = AccountVerifcationObj;