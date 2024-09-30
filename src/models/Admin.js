const mongoose = require('mongoose');
const mongooseIntlPhoneNumber = require('mongoose-intl-phone-number');
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

const AdminSchema = new Schema({
  email: { type: String, lowercase: true, trim: true, required: true, index: true, unique: true },
  role: {
    type: String,
    enum: ['superadmin', 'admin', 'employee']
  },
  firstName: { type: String, trim: true, required: true },
  lastName: { type: String, trim: true, required: true },
  mobilePhone: String,
  password: String,
  awsDirectory: String,
  timezone: String,
  profilePic: Object,
  permissions: Object,
  lastLoginEnabled: { type: Boolean, default: false },
  lastLogin: Array,
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'Admin'
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'Admin'
  },
  isActive: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

AdminSchema.plugin(mongooseIntlPhoneNumber, {
  hook: 'validate',
  phoneNumberField: 'mobilePhone',
  nationalFormatField: 'nationalFormat',
  internationalFormatField: 'internationalFormat',
  countryCodeField: 'countryCode',
});

AdminSchema.plugin(uniqueValidator);

const AdminObj = mongoose.model('Admin', AdminSchema);
module.exports = AdminObj;
