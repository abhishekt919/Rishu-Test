const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true, unique: true }, // Ensure one OTP per user
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Otp', otpSchema);
