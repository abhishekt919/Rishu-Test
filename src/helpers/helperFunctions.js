const jwt = require("jsonwebtoken");
const CryptoJS = require("crypto-js");
const NodeGeocoder = require("node-geocoder");
const twilio = require("twilio");
require("dotenv").config();
const nodemailer = require("nodemailer");
const Otp = require('../models/OtpVerification');

const errorRetrievingData = "Something went wrong. Please try again.";

// Create JWT
const createJwtToken = (user) => {
  const token = jwt.sign(
    { email: user.email, userId: user._id },
    process.env.TOKEN_SECRET,
    { expiresIn: "30d" }
  );
  return token;
};

// Decrypt Password
const decryptPassword = (text) => {
  let bytes = CryptoJS.AES.decrypt(text, process.env.TOKEN_SECRET);
  let originalText = bytes.toString(CryptoJS.enc.Utf8);
  return originalText;
};

// Encrypt Password
const encryptPassword = (text) => {
  let bytes = CryptoJS.AES.encrypt(text, process.env.TOKEN_SECRET);
  let originalText = bytes.toString();
  return originalText;
};

// Error Handler Message.
const errorHandler = (message = errorRetrievingData) => {
  return {
    status: "failure",
    messageId: 203,
    message: message,
  };
};

// Make first letter capital
const firstLetterCapital = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

// Generate Password
const generatePassword = (length) => {
  let result = "";
  let chars = "123456789^$@abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPRSTUVWXYZ";
  for (let i = length; i > 0; --i)
    result += chars[Math.floor(Math.random() * chars.length)];
  return result;
};

// Generate Machine IP
const generateMachineIP = (kioskNumber) => {
  let divisor = 256;
  let quotient = Math.floor(kioskNumber / divisor);
  let remainder = kioskNumber % divisor;
  let machineIP = "10.151." + quotient + "." + remainder;
  return machineIP;
};

// Generate Referral Code
const generateReferralCode = (length) => {
  let result = "";
  let chars = "23456789ABCDEFGHJKLMNPRSTUVWXYZ";
  for (let i = length; i > 0; --i)
    result += chars[Math.floor(Math.random() * chars.length)];
  return result;
};

// Get Address From Geocoder
const getAddressFromGeocoder = async (address) => {
  try {
    const geoCodeOptions = {
      provider: "google",
      apiKey: process.env.GoogleMapAPIKey,
    };

    const geocoder = NodeGeocoder(geoCodeOptions);
    const response = await geocoder.geocode(address);
    if (response?.length) {
      return Promise.resolve(response[0]);
    }
  } catch (error) {
    return Promise.resolve(error);
  }
};

// Generate Random String
const randomString = (length) => {
  let result = "";
  let chars = "123456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPRSTUVWXYZ";
  for (let i = length; i > 0; --i)
    result += chars[Math.floor(Math.random() * chars.length)];
  return result + "-" + Date.now().toString();
};

// 6 Digit Code
const verificationCode = () => {
  let code = Math.floor(100000 + Math.random() * 900000);
  return code;
};
//Getting otp.
const client = twilio(process.env.TwilioAccountSid, process.env.TwilioAccountToken);

const sendOTP = async (phoneNumber) => {
  try {
    // Generate a new OTP
    const otpCode = verificationCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes

    // Delete any existing OTP for this phone number
    await Otp.deleteOne({ phoneNumber });

    // Save new OTP to database
    const otpEntry = new Otp({ phoneNumber, otp: otpCode, expiresAt });
    await otpEntry.save();

    // Send OTP via Twilio
    const message = await client.messages.create({
      body: `Your OTP is ${otpCode}. It will expire in 5 minutes.`,
      from: process.env.TwilioPhoneNumber,
      to: phoneNumber,
    });

    console.log("OTP Sent:", message.sid);
    return { success: true, message: "OTP sent successfully" };
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw new Error("Failed to send OTP");
  }
};

const verifyOTP = async (phoneNumber, otp) => {
  try {
    // Find OTP entry in database
    const otpEntry = await Otp.findOne({ phoneNumber });

    if (!otpEntry) {
      return { success: false, message: "OTP not found or expired" };
    }

    // Check if OTP matches and is still valid
    if (otpEntry.otp !== otp) {
      return { success: false, message: "Invalid OTP" };
    }

    if (otpEntry.expiresAt < new Date()) {
      return { success: false, message: "OTP has expired" };
    }

    // OTP is valid, delete it from the database after successful verification
    await Otp.deleteOne({ phoneNumber });

    return { success: true, message: "OTP verified successfully" };
  } catch (error) {
    console.error("Error verifying OTP:", error);
    throw new Error("OTP verification failed");
  }
};

// Sending message using twilio

const sendMessage = async (phone, message) => {
  try {
    const client = twilio(
      process.env.TwilioAccountSid,
      process.env.TwilioAccountToken
    );

    const response = await client.messages.create({
      body: message,
      from: process.env.TwilioPhoneNumber,
      to: phone,
    });

    console.log("Message sent:", response.sid);
    return { success: true, message: "SMS sent successfully" };
  } catch (error) {
    console.error("Error sending SMS:", error);
    return { success: false, message: "Failed to send SMS", error };
  }
};

const sendBookingConfirmation = async (to, title, eventDate, seatCount) => {
  const messageBody = `Your booking for "${title}" on ${eventDate} is confirmed. Seat(s) booked: ${seatCount}.\nThank you!`;
  return await sendMessage(to, messageBody);
};

// Create a transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: "gmail", 
  auth: {
    user: process.env.GMAIL_USER, 
    pass: process.env.GMAIL_PASS,
  },
});

const sendEmail = async (to, subject, text, html) => {
    const mailOptions = {
      from: process.env.GMAIL_USER,  // Sender address
      to,                            // List of recipients
      subject,                       // Subject line
      text,                          // Plain text body
      html,                          // HTML body
    };
  
    try {
      // Send email
      await transporter.sendMail(mailOptions);
      console.log('Email sent successfully');
    } catch (error) {
      console.error('Error sending email', error);
    }
  };
  

module.exports = {
  createJwtToken,
  decryptPassword,
  encryptPassword,
  errorHandler,
  firstLetterCapital,
  generateMachineIP,
  generatePassword,
  generateReferralCode,
  getAddressFromGeocoder,
  randomString,
  verificationCode,
  sendBookingConfirmation,
  sendEmail,
  sendOTP,
  verifyOTP
};
