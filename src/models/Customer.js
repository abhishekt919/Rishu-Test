const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, lowercase: true, required: true, unique: true },
  stripeCustomerId: { type: String },
});

const CustomerObj = mongoose.model("Customer", customerSchema);
module.exports = CustomerObj;