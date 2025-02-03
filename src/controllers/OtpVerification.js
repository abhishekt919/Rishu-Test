// controllers/authController.js
const { sendOTP, verifyOTP } = require('../helpers/helperFunctions');

exports.sendOTPCode = async (req, res) => {
  const { phoneNumber } = req.body;
  if (!phoneNumber) {
    return res.status(400).json({ error: "Phone number is required" });
  }

  try {
    const response = await sendOTP(phoneNumber);
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in sendOTPCode:", error);
    return res.status(500).json({ error: "Failed to send OTP" });
  }
};

exports.verifyOTPCode = async (req, res) => {
  const { phoneNumber, otp } = req.body;
  if (!phoneNumber || !otp) {
    return res.status(400).json({ error: "Phone number and OTP are required" });
  }

  try {
    const response = await verifyOTP(phoneNumber, otp);
    if (response.success) {
      return res.status(200).json(response);
    } else {
      return res.status(400).json(response);
    }
  } catch (error) {
    console.error("Error in verifyOTPCode:", error);
    return res.status(500).json({ error: "OTP verification failed" });
  }
};
