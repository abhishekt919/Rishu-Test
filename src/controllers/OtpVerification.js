const { sendOTP, verifyOTP } = require('../helpers/helperFunctions');

exports.sendOTPCode = async (req, res) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return res.jsonp({
      status: "error",
      messageId: 400,
      message: "Phone number is required",
    });
  }

  try {
    const response = await sendOTP(phoneNumber);
    if (response.success) {
      return res.jsonp({
        status: "success",
        messageId: 200,
        message: response.message, // e.g., "OTP sent successfully"
      });
    } else {
      return res.jsonp({
        status: "error",
        messageId: 400,
        message: response.message,
      });
    }
  } catch (error) {
    return res.jsonp({
      status: "error",
      messageId: 500,
      message: "Failed to send OTP",
    });
  }
};

exports.verifyOTPCode = async (req, res) => {
  const { phoneNumber, otp } = req.body;

  if (!phoneNumber || !otp) {
    return res.jsonp({
      status: "error",
      messageId: 400,
      message: "Phone number and OTP are required",
    });
  }

  try {
    const response = await verifyOTP(phoneNumber, otp);
    if (response.success) {
      return res.jsonp({
        status: "success",
        messageId: 200,
        message: response.message, // e.g., "OTP verified successfully"
      });
    } else {
      return res.jsonp({
        status: "error",
        messageId: 400,
        message: response.message,
      });
    }
  } catch (error) {
    return res.jsonp({
      status: "error",
      messageId: 500,
      message: "OTP verification failed",
    });
  }
};
