const express = require('express');
const router = express.Router();
const { sendOTPCode, verifyOTPCode } = require('../controllers/OtpVerification');

router.post('/send-otp', sendOTPCode);
router.post('/verify-otp', verifyOTPCode);

module.exports = router;
