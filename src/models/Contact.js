// models/Contact.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ContactSchema = new Schema({
  firstName: String,
  lastName: String,
  email: String,
  phoneNumber: String,
  image: String, // Field to store the image path
}, { timestamps: true });

const ContactObj = mongoose.model('Contact', ContactSchema);
module.exports = ContactObj;
