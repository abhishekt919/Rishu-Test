const jwt = require("jsonwebtoken");
const CryptoJS = require('crypto-js');
const NodeGeocoder = require("node-geocoder");

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
        message: message
    };
};

// Make first letter capital 
const firstLetterCapital = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

// Generate Password
const generatePassword = (length) => {
    let result = '';
    let chars = '123456789^$@abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPRSTUVWXYZ';
    for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
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
    let result = '';
    let chars = '23456789ABCDEFGHJKLMNPRSTUVWXYZ';
    for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
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
    let result = '';
    let chars = '123456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPRSTUVWXYZ';
    for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result + "-" + Date.now().toString();
};

// 6 Digit Code
const verificationCode = () => {
    let code = Math.floor(100000 + Math.random() * 900000);
    return code;
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
    verificationCode
};
